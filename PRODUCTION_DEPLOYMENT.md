# Comunidad Viva - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Comunidad Viva application to production. The application consists of a NestJS backend API and a Next.js frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Health Checks & Monitoring](#health-checks--monitoring)
7. [Security Checklist](#security-checklist)
8. [Post-Deployment Validation](#post-deployment-validation)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x (optional, for caching)
- SSL Certificate (for HTTPS)
- Domain name(s) configured

### Required Services

- Database: PostgreSQL instance
- SMTP Server: For email notifications
- Storage: S3 or compatible object storage
- (Optional) Stripe account for payments
- (Optional) Sentry account for error tracking

---

## Environment Configuration

### Backend Environment Variables

Copy `.env.production.example` to `.env.production` and configure:

```bash
cp .env.production.example .env.production
```

**Critical Variables to Update:**

1. **Security**
   ```bash
   JWT_SECRET=<64-character-random-string>
   # Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Database**
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/comunidad_viva?schema=public
   ```

3. **URLs**
   ```bash
   API_URL=https://api.your-domain.com
   FRONTEND_URL=https://your-domain.com,https://www.your-domain.com
   ```

4. **Email (SMTP)**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Frontend Environment Variables

Create `packages/web/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
```

---

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE comunidad_viva;
CREATE USER comunidad WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE comunidad_viva TO comunidad;
```

### 2. Run Migrations

```bash
cd packages/backend
npx prisma migrate deploy
```

### 3. (Optional) Seed Initial Data

```bash
npm run seed
```

### 4. Database Backups

Set up automated backups:

```bash
# Example using pg_dump (configure in cron)
pg_dump -U comunidad -h localhost comunidad_viva > backup_$(date +%Y%m%d).sql
```

---

## Backend Deployment

### Option 1: Docker Deployment (Recommended)

```bash
# Build Docker image
cd packages/backend
docker build -t comunidad-viva-backend:latest .

# Run container
docker run -d \
  --name comunidad-backend \
  --env-file .env.production \
  -p 4000:4000 \
  comunidad-viva-backend:latest
```

### Option 2: PM2 Deployment

```bash
cd packages/backend

# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start dist/main.js --name comunidad-backend \
  --env production \
  --instances 2 \
  --max-memory-restart 1G

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 3: Systemd Service

Create `/etc/systemd/system/comunidad-backend.service`:

```ini
[Unit]
Description=Comunidad Viva Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/comunidad-viva/packages/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable comunidad-backend
sudo systemctl start comunidad-backend
```

---

## Frontend Deployment

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd packages/web
vercel --prod
```

### Option 2: Docker + Nginx

```bash
# Build Next.js
cd packages/web
npm run build

# Build Docker image
docker build -t comunidad-viva-web:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Static Export + CDN

```bash
cd packages/web
npm run build

# Copy .next/standalone to your web server
# Configure Nginx to serve the application
```

**Nginx Configuration Example:**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/docs {
        deny all;  # Disable Swagger in production
    }
}
```

---

## Health Checks & Monitoring

### Health Check Endpoints

The backend provides health check endpoints:

- **Basic Health:** `GET /health`
- **Detailed Status:** `GET /health/status`

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "up"
  },
  "memory": {
    "used": 256,
    "total": 512
  }
}
```

### Monitoring Setup

1. **Configure Uptime Monitoring**
   - Use services like UptimeRobot, Pingdom, or StatusCake
   - Monitor: `/health` endpoint every 5 minutes

2. **Set Up Sentry (Error Tracking)**
   ```bash
   # Add to .env.production
   SENTRY_DSN=https://your-sentry-dsn
   ```

3. **Log Aggregation**
   - PM2 logs: `pm2 logs comunidad-backend`
   - Docker logs: `docker logs -f comunidad-backend`
   - Configure log rotation

---

## Security Checklist

### Pre-Deployment Security

- [ ] All secrets in environment variables (not in code)
- [ ] JWT_SECRET is at least 64 characters of random data
- [ ] Database credentials are strong and unique
- [ ] CORS origins are explicitly set (no wildcards)
- [ ] SSL certificates are valid and configured
- [ ] Helmet.js security headers enabled
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Prisma ORM)
- [ ] XSS protection enabled
- [ ] CSRF protection for state-changing operations

### Post-Deployment Security

- [ ] Swagger API docs disabled in production (`NODE_ENV=production`)
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Error logs reviewed regularly
- [ ] Dependencies updated (no critical vulnerabilities)
- [ ] Firewall rules configured (only ports 80, 443 open)

### Run Security Audit

```bash
# Backend dependencies
cd packages/backend
npm audit --production

# Frontend dependencies
cd packages/web
npm audit --production
```

---

## Post-Deployment Validation

### 1. Verify Backend

```bash
# Health check
curl https://api.your-domain.com/health

# Test authentication
curl -X POST https://api.your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'
```

### 2. Verify Frontend

- Navigate to https://your-domain.com
- Check browser console for errors
- Test user registration
- Test login
- Create a test offer
- Create a test event

### 3. Test All MVP Features

- [ ] User registration and login
- [ ] Social feed (posts, comments, reactions)
- [ ] Credits system (view balance, transactions)
- [ ] Time bank (offers, exchanges)
- [ ] Group buys (create, join)
- [ ] QR check-in at events
- [ ] KPI dashboard
- [ ] Reviews system

### 4. Performance Testing

```bash
# Simple load test with Apache Bench
ab -n 1000 -c 10 https://api.your-domain.com/health

# Or use k6
k6 run loadtest.js
```

---

## Troubleshooting

### Backend Won't Start

1. **Check logs:**
   ```bash
   pm2 logs comunidad-backend --lines 100
   # or
   docker logs comunidad-backend --tail 100
   ```

2. **Common issues:**
   - Database connection: Verify `DATABASE_URL`
   - Port in use: Check if port 4000 is available
   - Environment variables: Ensure `.env.production` is loaded

### Frontend Build Errors

1. **TypeScript errors:**
   ```bash
   cd packages/web
   npm run build
   ```
   Note: ESLint warnings are currently set to not block builds (see `next.config.js`)

2. **API connection issues:**
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check CORS configuration on backend

### Database Connection Issues

1. **Test connection:**
   ```bash
   psql -U comunidad -h localhost -d comunidad_viva
   ```

2. **Check PostgreSQL logs:**
   ```bash
   sudo journalctl -u postgresql -n 50
   ```

### 500 Internal Server Errors

1. Check application logs for stack traces
2. Verify all required environment variables are set
3. Check database migrations are applied
4. Review recent code changes

---

## Maintenance

### Regular Tasks

- **Daily:** Check error logs and monitoring alerts
- **Weekly:** Review security audit output
- **Monthly:** Update dependencies (security patches)
- **Quarterly:** Review and rotate secrets (if applicable)

### Database Maintenance

```bash
# Vacuum database
psql -U comunidad -d comunidad_viva -c "VACUUM ANALYZE;"

# Check database size
psql -U comunidad -d comunidad_viva -c "SELECT pg_size_pretty(pg_database_size('comunidad_viva'));"
```

### Backup & Restore

```bash
# Backup
pg_dump -U comunidad -Fc comunidad_viva > backup.dump

# Restore
pg_restore -U comunidad -d comunidad_viva backup.dump
```

---

## Support

For production issues:

1. Check this documentation
2. Review application logs
3. Check health endpoints
4. Review monitoring dashboards
5. Consult development team if issues persist

---

## Changelog

- **2025-10-07:** Initial production deployment guide
- Backend version: 1.0.0
- Frontend version: 1.0.0
- All 7 MVP features implemented and tested
