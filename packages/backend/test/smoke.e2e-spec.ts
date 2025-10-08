import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Smoke Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Checks', () => {
    it('/health (GET) - should return ok status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });

    it('/health/status (GET) - should return detailed status', () => {
      return request(app.getHttpServer())
        .get('/health/status')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toMatch(/healthy|degraded/);
          expect(res.body.services).toHaveProperty('database');
          expect(res.body).toHaveProperty('memory');
        });
    });
  });

  describe('Authentication Flow', () => {
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test1234!',
      name: 'Test User',
    };

    it('/auth/register (POST) - should register new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('/auth/login (POST) - should login user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('/auth/login (POST) - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong_password',
        })
        .expect(401);
    });
  });

  describe('Protected Endpoints', () => {
    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('should accept authenticated requests', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Credits System', () => {
    it('/credits/balance (GET) - should get user balance', () => {
      return request(app.getHttpServer())
        .get('/credits/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('credits');
          expect(typeof res.body.credits).toBe('number');
        });
    });

    it('/credits/transactions (GET) - should get transaction history', () => {
      return request(app.getHttpServer())
        .get('/credits/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Social Feed', () => {
    let postId: string;

    it('/social/posts (POST) - should create post', () => {
      return request(app.getHttpServer())
        .post('/social/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test post for smoke testing',
          type: 'STORY',
          visibility: 'PUBLIC',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('Test post for smoke testing');
          postId = res.body.id;
        });
    });

    it('/social/feed (GET) - should get feed', () => {
      return request(app.getHttpServer())
        .get('/social/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/social/posts/:id (GET) - should get single post', () => {
      return request(app.getHttpServer())
        .get(`/social/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(postId);
        });
    });
  });

  describe('Offers', () => {
    it('/offers (GET) - should get offers list', () => {
      return request(app.getHttpServer())
        .get('/offers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Events', () => {
    it('/events (GET) - should get events list', () => {
      return request(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Search', () => {
    it('/search (GET) - should search with query', () => {
      return request(app.getHttpServer())
        .get('/search?q=test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('offers');
          expect(res.body).toHaveProperty('events');
        });
    });
  });

  describe('Input Validation', () => {
    it('should reject requests with invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: '123', // too short
          name: '',
        })
        .expect(400);
    });

    it('should reject requests with extra fields when whitelist is enabled', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          name: 'Test User',
          maliciousField: 'should be rejected',
        })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should return proper error format', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });
});
