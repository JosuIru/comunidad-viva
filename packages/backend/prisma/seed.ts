import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos de prueba...');

  // Limpiar datos existentes usando TRUNCATE CASCADE (más rápido y evita problemas de foreign keys)
  console.log('🗑️  Limpiando datos existentes...');

  // Usar SQL raw para truncate en cascade (PostgreSQL)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "Community" CASCADE');

  console.log('✓ Base de datos limpiada');

  const hashedPassword = await bcrypt.hash('Test1234!', 10);

  // ==========================================
  // USUARIOS CON DIFERENTES NIVELES
  // ==========================================
  console.log('👥 Creando usuarios...');

  const users = await Promise.all([
    // Usuario 1: Alta reputación - Validador Experto
    prisma.user.create({
      data: {
        email: 'maria@comunidad.local',
        password: hashedPassword,
        name: 'María García',
        bio: 'Activista comunitaria, organizadora de eventos locales. Me encanta ayudar a los vecinos.',
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: 'CITIZEN',
        lat: 42.9940,
        lng: -1.7217,
        address: 'Calle Mayor 15, Pamplona',
        neighborhood: 'Centro',
        credits: 250,
        level: 5,
        experience: 1500,
        peopleHelped: 120,
        hoursShared: 300,
        hoursReceived: 50,
        totalSaved: 850,
        co2Avoided: 125,
        voteCredits: 50,
        interests: ['jardinería', 'cocina', 'reparación', 'eventos'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 2: Reputación media - Validador Activo
    prisma.user.create({
      data: {
        email: 'juan@comunidad.local',
        password: hashedPassword,
        name: 'Juan Martínez',
        bio: 'Carpintero y manitas. Ofrezco reparaciones y clases de bricolaje.',
        avatar: 'https://i.pravatar.cc/150?img=12',
        role: 'CITIZEN',
        lat: 42.8931,
        lng: -1.6322,
        address: 'Plaza España 8, Pamplona',
        neighborhood: 'Centro',
        credits: 180,
        level: 3,
        experience: 800,
        peopleHelped: 55,
        hoursShared: 120,
        hoursReceived: 30,
        totalSaved: 420,
        co2Avoided: 60,
        voteCredits: 30,
        interests: ['carpintería', 'bricolaje', 'reciclaje'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 3: Nuevo usuario
    prisma.user.create({
      data: {
        email: 'ana@comunidad.local',
        password: hashedPassword,
        name: 'Ana López',
        bio: 'Profesora de idiomas. Ofrezco clases de inglés y francés.',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'CITIZEN',
        lat: 42.9701,
        lng: -1.7545,
        address: 'Calle Alcalá 42, Pamplona',
        neighborhood: 'Centro',
        credits: 50,
        level: 1,
        experience: 100,
        peopleHelped: 8,
        hoursShared: 15,
        hoursReceived: 5,
        totalSaved: 75,
        co2Avoided: 10,
        voteCredits: 15,
        interests: ['idiomas', 'educación', 'lectura'],
        weeklyMood: 'LEARNING',
      },
    }),

    // Usuario 4: Comercio local
    prisma.user.create({
      data: {
        email: 'tienda@comunidad.local',
        password: hashedPassword,
        name: 'Tienda Eco Local',
        bio: 'Comercio de productos ecológicos y locales. Apoyamos la economía circular.',
        avatar: 'https://i.pravatar.cc/150?img=20',
        role: 'MERCHANT',
        lat: 42.8073,
        lng: -1.5397,
        address: 'Calle Preciados 25, Pamplona',
        neighborhood: 'Centro',
        credits: 100,
        level: 2,
        experience: 300,
        peopleHelped: 25,
        totalSaved: 200,
        voteCredits: 20,
        interests: ['sostenibilidad', 'productos-locales', 'ecología'],
      },
    }),

    // Usuario 5: Organizador de eventos
    prisma.user.create({
      data: {
        email: 'carlos@comunidad.local',
        password: hashedPassword,
        name: 'Carlos Ruiz',
        bio: 'Organizador de eventos comunitarios y talleres.',
        avatar: 'https://i.pravatar.cc/150?img=8',
        role: 'CITIZEN',
        lat: 42.9732,
        lng: -1.5205,
        address: 'Gran Vía 30, Pamplona',
        neighborhood: 'Centro',
        credits: 150,
        level: 4,
        experience: 1000,
        peopleHelped: 80,
        hoursShared: 200,
        hoursReceived: 40,
        totalSaved: 600,
        co2Avoided: 90,
        voteCredits: 40,
        interests: ['eventos', 'música', 'arte', 'comunidad'],
        weeklyMood: 'ORGANIZING',
      },
    }),

    // Usuario 6: De Andia - Pastor y quesero
    prisma.user.create({
      data: {
        email: 'kepa@andia.eus',
        password: hashedPassword,
        name: 'Kepa Etxeberria',
        bio: 'Artzaina eta gaztagintzailea. Gazta ekologikoa eta bertakoa ekoizten dut.',
        avatar: 'https://i.pravatar.cc/150?img=14',
        role: 'MERCHANT',
        lat: 42.85,
        lng: -2.05,
        address: 'Lezaun, Navarra',
        neighborhood: 'Andia',
        credits: 120,
        level: 3,
        experience: 650,
        peopleHelped: 35,
        hoursShared: 80,
        totalSaved: 300,
        co2Avoided: 45,
        voteCredits: 25,
        interests: ['ganadería', 'queso', 'productos-locales', 'sostenibilidad'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 7: De Valdizarbe - Agricultor ecológico
    prisma.user.create({
      data: {
        email: 'javier@valdizarbe.com',
        password: hashedPassword,
        name: 'Javier Arana',
        bio: 'Agricultor ecológico. Verduras de temporada y cereales antiguos.',
        avatar: 'https://i.pravatar.cc/150?img=33',
        role: 'MERCHANT',
        lat: 42.55,
        lng: -1.75,
        address: 'Artajona, Navarra',
        neighborhood: 'Valdizarbe',
        credits: 180,
        level: 4,
        experience: 950,
        peopleHelped: 65,
        hoursShared: 150,
        totalSaved: 520,
        co2Avoided: 85,
        voteCredits: 35,
        interests: ['agricultura', 'ecológico', 'cereales', 'huerto'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 8: De Améscoa - Herrera artesano
    prisma.user.create({
      data: {
        email: 'mikel@ameskoa.eus',
        password: hashedPassword,
        name: 'Mikel Zubiria',
        bio: 'Burdingintzailea. Tresna eta objektu artisauak egiten ditut burdinarekin.',
        avatar: 'https://i.pravatar.cc/150?img=51',
        role: 'CITIZEN',
        lat: 42.75,
        lng: -2.25,
        address: 'Zudaire, Navarra',
        neighborhood: 'Améscoa',
        credits: 90,
        level: 2,
        experience: 450,
        peopleHelped: 28,
        hoursShared: 70,
        totalSaved: 250,
        co2Avoided: 35,
        voteCredits: 20,
        interests: ['herrería', 'artesanía', 'metal', 'reparación'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 9: De Améscoa - Productora de miel
    prisma.user.create({
      data: {
        email: 'aitziber@ameskoa.eus',
        password: hashedPassword,
        name: 'Aitziber Landa',
        bio: 'Erlezaina. Eztia eta ezti-produktuak saltzen ditut.',
        avatar: 'https://i.pravatar.cc/150?img=44',
        role: 'MERCHANT',
        lat: 42.76,
        lng: -2.24,
        address: 'San Martín de Améscoa, Navarra',
        neighborhood: 'Améscoa',
        credits: 110,
        level: 3,
        experience: 580,
        peopleHelped: 42,
        hoursShared: 95,
        totalSaved: 380,
        co2Avoided: 50,
        voteCredits: 28,
        interests: ['apicultura', 'miel', 'productos-naturales', 'ecología'],
        weeklyMood: 'AVAILABLE',
      },
    }),
  ]);

  console.log(`✓ Creados ${users.length} usuarios`);

  // ==========================================
  // SKILLS
  // ==========================================
  console.log('🎓 Creando habilidades...');

  await Promise.all([
    prisma.skill.create({
      data: {
        userId: users[0].id,
        category: 'Hogar',
        name: 'Jardinería',
        description: 'Cuidado de plantas, huertos urbanos',
        verified: true,
        endorsements: 15,
      },
    }),
    prisma.skill.create({
      data: {
        userId: users[0].id,
        category: 'Cocina',
        name: 'Cocina vegetariana',
        description: 'Recetas saludables y sostenibles',
        verified: true,
        endorsements: 20,
      },
    }),
    prisma.skill.create({
      data: {
        userId: users[1].id,
        category: 'Reparación',
        name: 'Carpintería',
        description: 'Reparación de muebles, bricolaje',
        verified: true,
        endorsements: 30,
      },
    }),
    prisma.skill.create({
      data: {
        userId: users[2].id,
        category: 'Educación',
        name: 'Inglés',
        description: 'Clases de inglés todos los niveles',
        verified: false,
        endorsements: 5,
      },
    }),
  ]);

  console.log('✓ Creadas habilidades');

  // ==========================================
  // BADGES
  // ==========================================
  console.log('🏆 Asignando badges...');

  await Promise.all([
    prisma.userBadge.create({
      data: {
        userId: users[0].id,
        badgeType: 'HELPER_100',
        metadata: { earnedAt: new Date('2024-06-01') },
      },
    }),
    prisma.userBadge.create({
      data: {
        userId: users[0].id,
        badgeType: 'ORGANIZER',
        metadata: { eventsOrganized: 15 },
      },
    }),
    prisma.userBadge.create({
      data: {
        userId: users[1].id,
        badgeType: 'HELPER_50',
        metadata: { earnedAt: new Date('2024-08-15') },
      },
    }),
    prisma.userBadge.create({
      data: {
        userId: users[4].id,
        badgeType: 'ORGANIZER',
        metadata: { eventsOrganized: 20 },
      },
    }),
  ]);

  console.log('✓ Asignados badges');

  // ==========================================
  // CONEXIONES
  // ==========================================
  console.log('🤝 Creando conexiones...');

  await Promise.all([
    prisma.connection.create({
      data: {
        userId: users[0].id,
        connectedId: users[1].id,
        type: 'NEIGHBOR',
      },
    }),
    prisma.connection.create({
      data: {
        userId: users[0].id,
        connectedId: users[2].id,
        type: 'HELPER',
      },
    }),
    prisma.connection.create({
      data: {
        userId: users[1].id,
        connectedId: users[2].id,
        type: 'NEIGHBOR',
      },
    }),
    prisma.connection.create({
      data: {
        userId: users[0].id,
        connectedId: users[4].id,
        type: 'FRIEND',
      },
    }),
  ]);

  console.log('✓ Creadas conexiones');

  // ==========================================
  // OFERTAS
  // ==========================================
  console.log('🛍️  Creando ofertas...');

  const offers = await Promise.all([
    // Producto
    prisma.offer.create({
      data: {
        userId: users[3].id,
        type: 'PRODUCT',
        category: 'Alimentos',
        title: 'Verduras ecológicas de temporada',
        description: 'Verduras frescas cultivadas sin pesticidas. Disponibles: tomates, lechugas, calabacines.',
        images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999'],
        priceEur: 3.50,
        priceCredits: 35,
        stock: 20,
        lat: users[3].lat,
        lng: users[3].lng,
        address: users[3].address,
        tags: ['ecológico', 'local', 'temporada'],
        status: 'ACTIVE',
        featured: true,
        views: 45,
        interested: 12,
      },
    }),

    // Servicio
    prisma.offer.create({
      data: {
        userId: users[1].id,
        type: 'SERVICE',
        category: 'Reparación',
        title: 'Reparación de muebles',
        description: 'Arreglo todo tipo de muebles de madera. Restauración y barnizado.',
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'],
        priceEur: 25,
        priceCredits: 250,
        lat: users[1].lat,
        lng: users[1].lng,
        address: users[1].address,
        tags: ['reparación', 'carpintería', 'reciclaje'],
        status: 'ACTIVE',
        views: 30,
        interested: 8,
      },
    }),

    // Ofertas de Navarra - Queso de Andia
    prisma.offer.create({
      data: {
        userId: users[5].id, // Kepa Etxeberria
        type: 'PRODUCT',
        category: 'Alimentos',
        title: 'Gazta ekologikoa / Queso artesano de oveja',
        description: 'Andiako ardiekin egindako gazta artisaua. 100% naturala eta ekologikoa. / Queso artesano elaborado con leche de ovejas de la Sierra de Andía.',
        images: ['https://images.unsplash.com/photo-1452195100486-9cc805987862'],
        priceEur: 12,
        priceCredits: 120,
        stock: 15,
        lat: users[5].lat,
        lng: users[5].lng,
        address: users[5].address,
        tags: ['queso', 'artesano', 'ecológico', 'local', 'navarra'],
        status: 'ACTIVE',
        featured: true,
        views: 28,
        interested: 9,
      },
    }),

    // Verduras de Valdizarbe
    prisma.offer.create({
      data: {
        userId: users[6].id, // Javier Arana
        type: 'PRODUCT',
        category: 'Alimentos',
        title: 'Verduras ecológicas y cereales antiguos',
        description: 'Verduras de temporada cultivadas sin químicos. Trigo sarraceno, espelta y otras variedades tradicionales de Navarra.',
        images: ['https://images.unsplash.com/photo-1518843875459-f738682238a6'],
        priceEur: 4,
        priceCredits: 40,
        stock: 30,
        lat: users[6].lat,
        lng: users[6].lng,
        address: users[6].address,
        tags: ['verduras', 'ecológico', 'cereales', 'km0', 'navarra'],
        status: 'ACTIVE',
        featured: true,
        views: 35,
        interested: 14,
      },
    }),

    // Miel de Améscoa
    prisma.offer.create({
      data: {
        userId: users[8].id, // Aitziber Landa
        type: 'PRODUCT',
        category: 'Alimentos',
        title: 'Eztia / Miel de montaña de Améscoa',
        description: 'Ameskoako mendietako eztia. Ekoizpen artisaua eta ekologikoa. / Miel de flores de montaña del valle de Améscoa.',
        images: ['https://images.unsplash.com/photo-1587049352846-4a222e784443'],
        priceEur: 8,
        priceCredits: 80,
        stock: 25,
        lat: users[8].lat,
        lng: users[8].lng,
        address: users[8].address,
        tags: ['miel', 'ecológico', 'artesano', 'montaña', 'navarra'],
        status: 'ACTIVE',
        featured: true,
        views: 32,
        interested: 11,
      },
    }),

    // Herrería artesana de Améscoa
    prisma.offer.create({
      data: {
        userId: users[7].id, // Mikel Zubiria
        type: 'SERVICE',
        category: 'Artesanía',
        title: 'Burdin-lanak / Trabajos de herrería artesanal',
        description: 'Tresnak, dekorazioa eta konponketak burdinarekin. / Herramientas, decoración y reparaciones en hierro forjado.',
        images: ['https://images.unsplash.com/photo-1530105186532-c4e119c1b5f5'],
        priceEur: 35,
        priceCredits: 350,
        lat: users[7].lat,
        lng: users[7].lng,
        address: users[7].address,
        tags: ['herrería', 'artesanía', 'hierro', 'forja', 'navarra'],
        status: 'ACTIVE',
        views: 18,
        interested: 6,
      },
    }),
  ]);

  console.log(`✓ Creadas ${offers.length} ofertas`);

  // ==========================================
  // BANCO DE TIEMPO
  // ==========================================
  console.log('⏰ Creando ofertas de banco de tiempo...');

  const timeBankOffers = await Promise.all([
    prisma.offer.create({
      data: {
        userId: users[0].id,
        type: 'TIME_BANK',
        category: 'Hogar',
        title: 'Ayuda con jardinería',
        description: 'Puedo ayudarte con tu jardín o huerto urbano',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b'],
        lat: users[0].lat,
        lng: users[0].lng,
        tags: ['jardinería', 'plantas', 'huerto'],
        status: 'ACTIVE',
        timeBank: {
          create: {
            estimatedHours: 2,
            canTeach: true,
            maxStudents: 3,
            experienceLevel: 'INTERMEDIATE',
            toolsNeeded: ['guantes', 'pala'],
          },
        },
      },
      include: {
        timeBank: true,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[2].id,
        type: 'TIME_BANK',
        category: 'Educación',
        title: 'Clases de inglés',
        description: 'Clases particulares de inglés para todos los niveles',
        images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b'],
        lat: users[2].lat,
        lng: users[2].lng,
        tags: ['idiomas', 'educación', 'inglés'],
        status: 'ACTIVE',
        timeBank: {
          create: {
            estimatedHours: 1,
            canTeach: true,
            maxStudents: 5,
            experienceLevel: 'EXPERT',
            toolsNeeded: [],
          },
        },
      },
      include: {
        timeBank: true,
      },
    }),
  ]);

  console.log(`✓ Creadas ${timeBankOffers.length} ofertas de banco de tiempo`);

  // ==========================================
  // TRANSACCIONES BANCO DE TIEMPO
  // ==========================================
  console.log('💱 Creando transacciones de banco de tiempo...');

  const timeBankTransactions = await Promise.all([
    prisma.timeBankTransaction.create({
      data: {
        offerId: timeBankOffers[0].timeBank!.id,
        providerId: users[0].id,
        requesterId: users[1].id,
        hours: 2,
        credits: 20,
        scheduledFor: new Date('2024-10-01'),
        status: 'COMPLETED',
        description: 'Ayuda con el huerto urbano',
        completedAt: new Date('2024-10-01T18:00:00Z'),
      },
    }),
    prisma.timeBankTransaction.create({
      data: {
        offerId: timeBankOffers[1].timeBank!.id,
        providerId: users[2].id,
        requesterId: users[1].id,
        hours: 1,
        credits: 10,
        scheduledFor: new Date('2024-10-03'),
        status: 'COMPLETED',
        description: 'Clase de inglés básico',
        completedAt: new Date('2024-10-03T17:00:00Z'),
      },
    }),
    prisma.timeBankTransaction.create({
      data: {
        offerId: timeBankOffers[0].timeBank!.id,
        providerId: users[0].id,
        requesterId: users[2].id,
        hours: 3,
        credits: 30,
        scheduledFor: new Date('2024-10-05'),
        status: 'PENDING',
        description: 'Crear huerto en balcón',
      },
    }),
  ]);

  console.log(`✓ Creadas ${timeBankTransactions.length} transacciones`);

  // ==========================================
  // EVENTOS
  // ==========================================
  console.log('📅 Creando eventos...');

  const eventOffers = await Promise.all([
    prisma.offer.create({
      data: {
        userId: users[4].id,
        type: 'EVENT',
        category: 'Comunidad',
        title: 'Mercadillo de trueque mensual',
        description: 'Trae lo que ya no uses y llévate lo que necesites. ¡Sin dinero!',
        images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d'],
        lat: 42.7777,
        lng: -1.6593,
        address: 'Plaza del Carmen, Pamplona',
        tags: ['trueque', 'reciclaje', 'comunidad'],
        status: 'ACTIVE',
        views: 80,
        interested: 25,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[0].id,
        type: 'EVENT',
        category: 'Sostenibilidad',
        title: 'Taller de compostaje urbano',
        description: 'Aprende a hacer compost en casa y reducir tus residuos',
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09'],
        lat: 42.9321,
        lng: -1.6012,
        address: 'Centro Comunitario Lavapiés',
        tags: ['sostenibilidad', 'compostaje', 'taller'],
        status: 'ACTIVE',
        views: 60,
        interested: 15,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[1].id,
        type: 'EVENT',
        category: 'Cultura',
        title: 'Concierto comunitario de folk',
        description: 'Tarde de música en directo con artistas locales',
        images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745'],
        lat: 42.8167,
        lng: -1.6432,
        address: 'Parque de la Taconera, Pamplona',
        tags: ['música', 'cultura', 'comunidad'],
        status: 'ACTIVE',
        views: 120,
        interested: 45,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[2].id,
        type: 'EVENT',
        category: 'Deporte',
        title: 'Yoga en el parque',
        description: 'Sesión de yoga matutina al aire libre. Trae tu esterilla.',
        images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773'],
        lat: 42.8234,
        lng: -1.6512,
        address: 'Parque Yamaguchi, Pamplona',
        tags: ['yoga', 'deporte', 'bienestar'],
        status: 'ACTIVE',
        views: 85,
        interested: 32,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[3].id,
        type: 'EVENT',
        category: 'Gastronomía',
        title: 'Taller de cocina vegetariana',
        description: 'Aprende recetas saludables y sostenibles',
        images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d'],
        lat: 42.7985,
        lng: -1.6312,
        address: 'Centro Cívico Iturrama, Pamplona',
        tags: ['cocina', 'vegetariano', 'salud'],
        status: 'ACTIVE',
        views: 95,
        interested: 28,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[4].id,
        type: 'EVENT',
        category: 'Educación',
        title: 'Charla sobre permacultura',
        description: 'Introducción a la permacultura y diseño de huertos urbanos',
        images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399'],
        lat: 42.8456,
        lng: -1.6723,
        address: 'Casa de la Juventud, Pamplona',
        tags: ['permacultura', 'huerto', 'sostenibilidad'],
        status: 'ACTIVE',
        views: 72,
        interested: 18,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[0].id,
        type: 'EVENT',
        category: 'Arte',
        title: 'Taller de pintura mural comunitaria',
        description: 'Pintemos juntos un mural en el barrio',
        images: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b'],
        lat: 42.8089,
        lng: -1.6589,
        address: 'Plaza San Francisco, Pamplona',
        tags: ['arte', 'mural', 'comunidad'],
        status: 'ACTIVE',
        views: 110,
        interested: 35,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[1].id,
        type: 'EVENT',
        category: 'Tecnología',
        title: 'Taller de reparación de electrónicos',
        description: 'Repair Café: trae tu aparato roto y aprende a repararlo',
        images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'],
        lat: 42.7712,
        lng: -1.6145,
        address: 'Biblioteca de Iturrama, Pamplona',
        tags: ['reparación', 'tecnología', 'economía circular'],
        status: 'ACTIVE',
        views: 65,
        interested: 22,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[2].id,
        type: 'EVENT',
        category: 'Comunidad',
        title: 'Encuentro de vecinos de San Juan',
        description: 'Café y charla entre vecinos del barrio',
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622'],
        lat: 42.8301,
        lng: -1.6389,
        address: 'Bar Txoko, Pamplona',
        tags: ['vecinos', 'comunidad', 'barrio'],
        status: 'ACTIVE',
        views: 45,
        interested: 15,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[3].id,
        type: 'EVENT',
        category: 'Niños',
        title: 'Cuentacuentos en el parque',
        description: 'Tarde de cuentos y juegos para niños',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9'],
        lat: 42.8178,
        lng: -1.6298,
        address: 'Parque de la Ciudadela, Pamplona',
        tags: ['niños', 'cuentos', 'familia'],
        status: 'ACTIVE',
        views: 88,
        interested: 30,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[4].id,
        type: 'EVENT',
        category: 'Deporte',
        title: 'Carrera solidaria por el barrio',
        description: 'Carrera de 5km para promover el deporte y recaudar fondos',
        images: ['https://images.unsplash.com/photo-1452626038306-9aae5e071dd3'],
        lat: 42.7923,
        lng: -1.6756,
        address: 'Paseo Fluvial del Arga, Pamplona',
        tags: ['running', 'deporte', 'solidaridad'],
        status: 'ACTIVE',
        views: 130,
        interested: 55,
      },
    }),
    // EVENTOS EN ANDIA Y URBASA
    prisma.offer.create({
      data: {
        userId: users[5].id, // Kepa de Andia
        type: 'EVENT',
        category: 'Naturaleza',
        title: 'Ruta guiada por la Sierra de Andía',
        description: 'Excursión por los hayedos de Andía con un pastor local. Aprende sobre la trashumancia y el pastoreo tradicional.',
        images: ['https://images.unsplash.com/photo-1551632811-561732d1e306'],
        lat: 42.85,
        lng: -2.05,
        address: 'Lezaun, Sierra de Andía',
        tags: ['naturaleza', 'senderismo', 'cultura-rural'],
        status: 'ACTIVE',
        views: 65,
        interested: 28,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[7].id, // Mikel el herrero
        type: 'EVENT',
        category: 'Cultura',
        title: 'Taller de herrería tradicional',
        description: 'Aprende técnicas ancestrales de forja en la fragua de Améscoa',
        images: ['https://images.unsplash.com/photo-1533488069317-1ce38b68fb67'],
        lat: 42.76,
        lng: -2.24,
        address: 'Zudaire, Valle de Améscoa',
        tags: ['artesanía', 'herrería', 'tradición'],
        status: 'ACTIVE',
        views: 45,
        interested: 18,
      },
    }),
    // EVENTOS EN TIERRA ESTELLA
    prisma.offer.create({
      data: {
        userId: users[0].id,
        type: 'EVENT',
        category: 'Cultura',
        title: 'Mercado de productores de Tierra Estella',
        description: 'Mercado mensual de productos locales y artesanía. Txistorra, queso, miel, pan artesano...',
        images: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9'],
        lat: 42.67,
        lng: -2.03,
        address: 'Plaza de los Fueros, Estella-Lizarra',
        tags: ['mercado', 'productos-locales', 'km0'],
        status: 'ACTIVE',
        views: 95,
        interested: 42,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[1].id,
        type: 'EVENT',
        category: 'Comunidad',
        title: 'Auzolan: Limpieza del río Ega',
        description: 'Trabajo comunitario para limpiar las orillas del río Ega en Estella',
        images: ['https://images.unsplash.com/photo-1618477461853-cf6ed80faba5'],
        lat: 42.672,
        lng: -2.025,
        address: 'Río Ega, Estella-Lizarra',
        tags: ['auzolan', 'medioambiente', 'río'],
        status: 'ACTIVE',
        views: 58,
        interested: 24,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[8].id, // Amaia la apicultora
        type: 'EVENT',
        category: 'Educación',
        title: 'Taller de apicultura en Urbasa',
        description: 'Conoce el mundo de las abejas y la producción de miel en la sierra de Urbasa',
        images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62'],
        lat: 42.82,
        lng: -2.08,
        address: 'Olazti/Olazagutía, Urbasa',
        tags: ['apicultura', 'miel', 'naturaleza'],
        status: 'ACTIVE',
        views: 72,
        interested: 31,
      },
    }),
    // EVENTOS EN ARIZALA - OSTATU
    prisma.offer.create({
      data: {
        userId: users[2].id,
        type: 'EVENT',
        category: 'Educación',
        title: 'Charla sobre economía circular en Ostatua',
        description: 'Debate abierto sobre economía circular y consumo responsable en el local comunitario de Arizala',
        images: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644'],
        lat: 42.68,
        lng: -1.45,
        address: 'Ostatua, Arizala',
        tags: ['economía-circular', 'debate', 'sostenibilidad'],
        status: 'ACTIVE',
        views: 48,
        interested: 22,
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[0].id,
        type: 'EVENT',
        category: 'Cultura',
        title: 'Taller de cestería tradicional - Ostatua Arizala',
        description: 'Aprende a tejer cestas con mimbre siguiendo técnicas ancestrales navarras',
        images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9'],
        lat: 42.68,
        lng: -1.45,
        address: 'Ostatua, Arizala',
        tags: ['artesanía', 'cestería', 'tradición'],
        status: 'ACTIVE',
        views: 55,
        interested: 18,
      },
    }),
  ]);

  const events = await Promise.all([
    prisma.event.create({
      data: {
        offerId: eventOffers[0].id,
        organizerId: users[4].id,
        title: 'Mercadillo de trueque mensual',
        description: 'Trae lo que ya no uses y llévate lo que necesites. ¡Sin dinero!',
        lat: 42.7331,
        lng: -1.6727,
        address: 'Plaza del Carmen, Pamplona',
        startsAt: new Date('2025-11-15T10:00:00Z'),
        endsAt: new Date('2025-11-15T14:00:00Z'),
        capacity: 50,
        type: 'MARKET',
        tags: ['trueque', 'reciclaje', 'comunidad'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[1].id,
        organizerId: users[0].id,
        title: 'Taller de compostaje urbano',
        description: 'Aprende a hacer compost en casa y reducir tus residuos',
        lat: 42.7853,
        lng: -1.7818,
        address: 'Centro Comunitario Lavapiés',
        startsAt: new Date('2025-11-20T17:00:00Z'),
        endsAt: new Date('2025-11-20T19:00:00Z'),
        capacity: 20,
        type: 'WORKSHOP',
        tags: ['sostenibilidad', 'compostaje', 'taller'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[2].id,
        organizerId: users[1].id,
        title: 'Concierto comunitario de folk',
        description: 'Tarde de música en directo con artistas locales',
        lat: 42.8167,
        lng: -1.6432,
        address: 'Parque de la Taconera, Pamplona',
        startsAt: new Date('2025-11-22T18:00:00Z'),
        endsAt: new Date('2025-11-22T21:00:00Z'),
        capacity: 100,
        type: 'SOCIAL',
        tags: ['música', 'cultura', 'comunidad'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[3].id,
        organizerId: users[2].id,
        title: 'Yoga en el parque',
        description: 'Sesión de yoga matutina al aire libre. Trae tu esterilla.',
        lat: 42.8234,
        lng: -1.6512,
        address: 'Parque Yamaguchi, Pamplona',
        startsAt: new Date('2025-11-18T08:00:00Z'),
        endsAt: new Date('2025-11-18T09:30:00Z'),
        capacity: 30,
        type: 'SKILLSHARE',
        tags: ['yoga', 'deporte', 'bienestar'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[4].id,
        organizerId: users[3].id,
        title: 'Taller de cocina vegetariana',
        description: 'Aprende recetas saludables y sostenibles',
        lat: 42.7985,
        lng: -1.6312,
        address: 'Centro Cívico Iturrama, Pamplona',
        startsAt: new Date('2025-11-25T18:30:00Z'),
        endsAt: new Date('2025-11-25T21:00:00Z'),
        capacity: 15,
        type: 'WORKSHOP',
        tags: ['cocina', 'vegetariano', 'salud'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[5].id,
        organizerId: users[4].id,
        title: 'Charla sobre permacultura',
        description: 'Introducción a la permacultura y diseño de huertos urbanos',
        lat: 42.8456,
        lng: -1.6723,
        address: 'Casa de la Juventud, Pamplona',
        startsAt: new Date('2025-11-28T19:00:00Z'),
        endsAt: new Date('2025-11-28T21:00:00Z'),
        capacity: 40,
        type: 'SKILLSHARE',
        tags: ['permacultura', 'huerto', 'sostenibilidad'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[6].id,
        organizerId: users[0].id,
        title: 'Taller de pintura mural comunitaria',
        description: 'Pintemos juntos un mural en el barrio',
        lat: 42.8089,
        lng: -1.6589,
        address: 'Plaza San Francisco, Pamplona',
        startsAt: new Date('2025-11-30T10:00:00Z'),
        endsAt: new Date('2025-11-30T18:00:00Z'),
        capacity: 25,
        type: 'WORKSHOP',
        tags: ['arte', 'mural', 'comunidad'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[7].id,
        organizerId: users[1].id,
        title: 'Taller de reparación de electrónicos',
        description: 'Repair Café: trae tu aparato roto y aprende a repararlo',
        lat: 42.7712,
        lng: -1.6145,
        address: 'Biblioteca de Iturrama, Pamplona',
        startsAt: new Date('2025-11-02T16:00:00Z'),
        endsAt: new Date('2025-11-02T19:00:00Z'),
        capacity: 20,
        type: 'REPAIR_CAFE',
        tags: ['reparación', 'tecnología', 'economía circular'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[8].id,
        organizerId: users[2].id,
        title: 'Encuentro de vecinos de San Juan',
        description: 'Café y charla entre vecinos del barrio',
        lat: 42.8301,
        lng: -1.6389,
        address: 'Bar Txoko, Pamplona',
        startsAt: new Date('2025-11-05T18:00:00Z'),
        endsAt: new Date('2025-11-05T20:00:00Z'),
        capacity: 30,
        type: 'SOCIAL',
        tags: ['vecinos', 'comunidad', 'barrio'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[9].id,
        organizerId: users[3].id,
        title: 'Cuentacuentos en el parque',
        description: 'Tarde de cuentos y juegos para niños',
        lat: 42.8178,
        lng: -1.6298,
        address: 'Parque de la Ciudadela, Pamplona',
        startsAt: new Date('2025-11-07T17:00:00Z'),
        endsAt: new Date('2025-11-07T18:30:00Z'),
        capacity: 50,
        type: 'SOCIAL',
        tags: ['niños', 'cuentos', 'familia'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[10].id,
        organizerId: users[4].id,
        title: 'Carrera solidaria por el barrio',
        description: 'Carrera de 5km para promover el deporte y recaudar fondos',
        lat: 42.7923,
        lng: -1.6756,
        address: 'Paseo Fluvial del Arga, Pamplona',
        startsAt: new Date('2025-11-10T09:00:00Z'),
        endsAt: new Date('2025-11-10T12:00:00Z'),
        capacity: 100,
        type: 'CLEANUP',
        tags: ['running', 'deporte', 'solidaridad'],
        requirements: [],
      },
    }),
    // EVENTOS EN ANDIA, URBASA Y TIERRA ESTELLA
    prisma.event.create({
      data: {
        offerId: eventOffers[11].id,
        organizerId: users[5].id,
        title: 'Ruta guiada por la Sierra de Andía',
        description: 'Excursión por los hayedos de Andía con un pastor local. Aprende sobre la trashumancia y el pastoreo tradicional.',
        lat: 42.85,
        lng: -2.05,
        address: 'Lezaun, Sierra de Andía',
        startsAt: new Date('2025-11-23T09:00:00Z'),
        endsAt: new Date('2025-11-23T14:00:00Z'),
        capacity: 20,
        type: 'SOCIAL',
        tags: ['naturaleza', 'senderismo', 'cultura-rural'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[12].id,
        organizerId: users[7].id,
        title: 'Taller de herrería tradicional',
        description: 'Aprende técnicas ancestrales de forja en la fragua de Améscoa',
        lat: 42.76,
        lng: -2.24,
        address: 'Zudaire, Valle de Améscoa',
        startsAt: new Date('2025-11-26T10:00:00Z'),
        endsAt: new Date('2025-11-26T13:00:00Z'),
        capacity: 12,
        type: 'WORKSHOP',
        tags: ['artesanía', 'herrería', 'tradición'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[13].id,
        organizerId: users[0].id,
        title: 'Mercado de productores de Tierra Estella',
        description: 'Mercado mensual de productos locales y artesanía. Txistorra, queso, miel, pan artesano...',
        lat: 42.67,
        lng: -2.03,
        address: 'Plaza de los Fueros, Estella-Lizarra',
        startsAt: new Date('2025-11-16T10:00:00Z'),
        endsAt: new Date('2025-11-16T14:00:00Z'),
        capacity: 100,
        type: 'MARKET',
        tags: ['mercado', 'productos-locales', 'km0'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[14].id,
        organizerId: users[1].id,
        title: 'Auzolan: Limpieza del río Ega',
        description: 'Trabajo comunitario para limpiar las orillas del río Ega en Estella',
        lat: 42.672,
        lng: -2.025,
        address: 'Río Ega, Estella-Lizarra',
        startsAt: new Date('2025-11-29T09:00:00Z'),
        endsAt: new Date('2025-11-29T13:00:00Z'),
        capacity: 40,
        type: 'CLEANUP',
        tags: ['auzolan', 'medioambiente', 'río'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[15].id,
        organizerId: users[8].id,
        title: 'Taller de apicultura en Urbasa',
        description: 'Conoce el mundo de las abejas y la producción de miel en la sierra de Urbasa',
        lat: 42.82,
        lng: -2.08,
        address: 'Olazti/Olazagutía, Urbasa',
        startsAt: new Date('2025-11-27T10:00:00Z'),
        endsAt: new Date('2025-11-27T13:00:00Z'),
        capacity: 15,
        type: 'WORKSHOP',
        tags: ['apicultura', 'miel', 'naturaleza'],
        requirements: [],
      },
    }),
    // EVENTOS EN OSTATU ARIZALA
    prisma.event.create({
      data: {
        offerId: eventOffers[16].id,
        organizerId: users[2].id,
        title: 'Charla sobre economía circular en Ostatua',
        description: 'Debate abierto sobre economía circular y consumo responsable en el local comunitario de Arizala',
        lat: 42.68,
        lng: -1.45,
        address: 'Ostatua, Arizala',
        startsAt: new Date('2025-11-24T18:00:00Z'),
        endsAt: new Date('2025-11-24T20:00:00Z'),
        capacity: 25,
        type: 'SKILLSHARE',
        tags: ['economía-circular', 'debate', 'sostenibilidad'],
        requirements: [],
      },
    }),
    prisma.event.create({
      data: {
        offerId: eventOffers[17].id,
        organizerId: users[0].id,
        title: 'Taller de cestería tradicional - Ostatua Arizala',
        description: 'Aprende a tejer cestas con mimbre siguiendo técnicas ancestrales navarras',
        lat: 42.68,
        lng: -1.45,
        address: 'Ostatua, Arizala',
        startsAt: new Date('2025-11-30T16:00:00Z'),
        endsAt: new Date('2025-11-30T19:00:00Z'),
        capacity: 15,
        type: 'WORKSHOP',
        tags: ['artesanía', 'cestería', 'tradición'],
        requirements: [],
      },
    }),
  ]);

  console.log(`✓ Creados ${events.length} eventos`);

  // Registrar asistentes
  await Promise.all([
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: users[0].id,
        role: 'PARTICIPANT',
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: users[1].id,
        role: 'PARTICIPANT',
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[1].id,
        userId: users[1].id,
        role: 'VOLUNTEER',
      },
    }),
  ]);

  // ==========================================
  // POSTS Y RED SOCIAL
  // ==========================================
  console.log('📱 Creando posts...');

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        authorId: users[0].id,
        content: '¡Increíble jornada de intercambio de semillas hoy! 🌱 Gracias a todos los que vinieron. #ComunidadVerde',
        type: 'STORY',
        visibility: 'PUBLIC',
        images: [],
        tags: [],
        mentions: [],
        thanksCount: 15,
        commentsCount: 3,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[4].id,
        content: '📢 Próximo evento: Mercadillo de trueque el 15 de noviembre. ¡Apúntate!',
        type: 'OFFER',
        visibility: 'PUBLIC',
        images: [],
        tags: [],
        mentions: [],
        supportsCount: 22,
        commentsCount: 5,
        relatedOfferId: eventOffers[0].id,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[1].id,
        content: 'Terminé de restaurar esta silla antigua. ¡Quedó como nueva! ♻️',
        type: 'ACHIEVEMENT',
        images: ['https://images.unsplash.com/photo-1503602642458-232111445657'],
        visibility: 'PUBLIC',
        tags: [],
        mentions: [],
        thanksCount: 30,
        commentsCount: 8,
      },
    }),
  ]);

  console.log(`✓ Creados ${posts.length} posts`);

  // Comentarios
  await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: users[1].id,
        content: '¡Qué bonito! Me hubiera gustado ir',
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        authorId: users[0].id,
        content: '¡Ya me apunté! ¿Qué puedo llevar?',
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id,
        authorId: users[2].id,
        content: '¡Qué talento! ¿Haces restauraciones por encargo?',
      },
    }),
  ]);

  // Reacciones
  await Promise.all([
    prisma.reaction.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
        type: 'CELEBRATE',
      },
    }),
    prisma.reaction.create({
      data: {
        postId: posts[1].id,
        userId: users[0].id,
        type: 'SUPPORT',
      },
    }),
  ]);

  // ==========================================
  // TRANSACCIONES DE CRÉDITOS
  // ==========================================
  console.log('💰 Creando transacciones de créditos...');

  await Promise.all([
    prisma.creditTransaction.create({
      data: {
        userId: users[0].id,
        amount: 50,
        balance: 250,
        reason: 'COMMUNITY_HELP',
        description: 'Ayuda con jardinería - Juan',
        relatedId: timeBankTransactions[0].id,
      },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: users[1].id,
        amount: -50,
        balance: 180,
        reason: 'TIME_BANK_HOUR',
        description: 'Recibida ayuda con jardinería',
        relatedId: timeBankTransactions[0].id,
      },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: users[0].id,
        amount: 10,
        balance: 260,
        reason: 'ADMIN_GRANT',
        description: 'Recompensa por validar transacción',
      },
    }),
  ]);

  console.log('✓ Creadas transacciones de créditos');

  // ==========================================
  // SISTEMA DE CONSENSO
  // ==========================================
  console.log('⛓️  Creando datos de consenso...');

  // Trust Blocks
  const blocks = await Promise.all([
    prisma.trustBlock.create({
      data: {
        height: 1,
        hash: '0x0000abc123def456',
        previousHash: '0',
        type: 'HELP',
        actorId: users[0].id,
        content: {
          type: 'timebank',
          transactionId: timeBankTransactions[0].id,
          hours: 2,
          description: 'Ayuda con jardinería',
        },
        nonce: 12345,
        difficulty: 2,
        timestamp: new Date('2024-10-01T12:00:00Z'),
        status: 'APPROVED',
      },
    }),
    prisma.trustBlock.create({
      data: {
        height: 2,
        hash: '0x0000def789ghi012',
        previousHash: '0x0000abc123def456',
        type: 'HELP',
        actorId: users[2].id,
        content: {
          type: 'timebank',
          transactionId: timeBankTransactions[1].id,
          hours: 1,
          description: 'Clase de inglés',
        },
        nonce: 23456,
        difficulty: 2,
        timestamp: new Date('2024-10-03T12:00:00Z'),
        status: 'APPROVED',
      },
    }),
  ]);

  console.log(`✓ Creados ${blocks.length} trust blocks`);

  // Block Validations
  await Promise.all([
    prisma.blockValidation.create({
      data: {
        blockId: blocks[0].id,
        validatorId: users[1].id,
        decision: 'APPROVE',
        reason: 'Vi a María ayudando en el huerto comunitario',
        stake: 55,
      },
    }),
    prisma.blockValidation.create({
      data: {
        blockId: blocks[0].id,
        validatorId: users[2].id,
        decision: 'APPROVE',
        stake: 8,
      },
    }),
    prisma.blockValidation.create({
      data: {
        blockId: blocks[1].id,
        validatorId: users[0].id,
        decision: 'APPROVE',
        reason: 'Confirmado, Ana dio clase a Juan',
        stake: 120,
      },
    }),
  ]);

  console.log('✓ Creadas validaciones de bloques');

  // Propuestas
  const proposals = await Promise.all([
    prisma.proposal.create({
      data: {
        blockId: blocks[0].id,
        authorId: users[0].id,
        type: 'FEATURE',
        title: 'Crear Repair Café mensual',
        description: `Propongo crear un evento mensual tipo "Repair Café" donde los vecinos puedan traer objetos rotos para repararlos juntos.

Beneficios:
- Reducción de residuos
- Aprendizaje de habilidades
- Fortalecimiento comunitario
- Economía circular

El primer sábado de cada mes en el centro comunitario.`,
        requiredBudget: 50,
        implementationPlan: 'Reservar espacio, comprar herramientas básicas, promoción en redes',
        status: 'VOTING',
        discussionDeadline: new Date('2025-11-10T23:59:59Z'),
        votingDeadline: new Date('2025-11-15T23:59:59Z'),
      },
    }),
  ]);

  console.log(`✓ Creadas ${proposals.length} propuestas`);

  // Votos en propuestas
  await Promise.all([
    prisma.proposalVote.create({
      data: {
        proposalId: proposals[0].id,
        voterId: users[0].id,
        points: 5,
        cost: 25,
      },
    }),
    prisma.proposalVote.create({
      data: {
        proposalId: proposals[0].id,
        voterId: users[1].id,
        points: 3,
        cost: 9,
      },
    }),
    prisma.proposalVote.create({
      data: {
        proposalId: proposals[0].id,
        voterId: users[4].id,
        points: 4,
        cost: 16,
      },
    }),
  ]);

  console.log('✓ Creados votos en propuestas');

  // Comentarios en propuestas
  await Promise.all([
    prisma.proposalComment.create({
      data: {
        proposalId: proposals[0].id,
        authorId: users[1].id,
        content: '¡Excelente idea! Como carpintero, estaría encantado de ayudar con las reparaciones de muebles.',
      },
    }),
    prisma.proposalComment.create({
      data: {
        proposalId: proposals[0].id,
        authorId: users[4].id,
        content: 'Me parece perfecto. Podemos coordinarlo con otros eventos comunitarios.',
      },
    }),
  ]);

  console.log('✓ Creados comentarios en propuestas');

  // ==========================================
  // GAMIFICACIÓN: FLASH DEALS (COMMENTED OUT - Needs Merchant model)
  // ==========================================
  // console.log('⚡ Creando Flash Deals...');
  //
  // const flashDeals = await Promise.all([
  //   prisma.flashDeal.create({
  //     data: {
  //       merchantId: users[3].id,
  //       title: 'Descuento 50% en verduras ecológicas',
  //       product: 'Verduras de temporada',
  //       originalPrice: 700,
  //       discount: 50,
  //       maxRedemptions: 10,
  //       currentRedemptions: 3,
  //       expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 horas desde ahora
  //     },
  //   }),
  //   prisma.flashDeal.create({
  //     data: {
  //       merchantId: users[1].id,
  //       title: 'Reparación express con 40% descuento',
  //       product: 'Reparación de muebles pequeños',
  //       originalPrice: 2500,
  //       discount: 40,
  //       maxRedemptions: 5,
  //       currentRedemptions: 2,
  //       expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
  //     },
  //   }),
  // ]);
  //
  // console.log(`✓ Creados ${flashDeals.length} flash deals`);

  // ==========================================
  // GAMIFICACIÓN: CHALLENGES (COMMENTED OUT - Models don't exist)
  // ==========================================
  // console.log('🏆 Creando Challenges...');
  //
  // const challenges = await Promise.all([
  //   prisma.challenge.create({
  //     data: {
  //       title: 'Maestro de la Ayuda',
  //       description: 'Ayuda a 5 vecinos esta semana',
  //       type: 'WEEKLY',
  //       goal: 5,
  //       reward: 50,
  //       startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
  //       endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // En 5 días
  //       active: true,
  //     },
  //   }),
  //   prisma.challenge.create({
  //     data: {
  //       title: 'Creador de Contenido',
  //       description: 'Publica 3 ofertas esta semana',
  //       type: 'WEEKLY',
  //       goal: 3,
  //       reward: 30,
  //       startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //       endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  //       active: true,
  //     },
  //   }),
  //   prisma.challenge.create({
  //     data: {
  //       title: 'Organizador Social',
  //       description: 'Asiste a 2 eventos comunitarios',
  //       type: 'WEEKLY',
  //       goal: 2,
  //       reward: 40,
  //       startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //       endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  //       active: true,
  //     },
  //   }),
  // ]);
  //
  // console.log(`✓ Creados ${challenges.length} challenges`);
  //
  // // Participaciones en challenges
  // await Promise.all([
  //   prisma.challengeParticipation.create({
  //     data: {
  //       challengeId: challenges[0].id,
  //       userId: users[0].id,
  //       progress: 4,
  //       completed: false,
  //     },
  //   }),
  //   prisma.challengeParticipation.create({
  //     data: {
  //       challengeId: challenges[0].id,
  //       userId: users[1].id,
  //       progress: 2,
  //       completed: false,
  //     },
  //   }),
  //   prisma.challengeParticipation.create({
  //     data: {
  //       challengeId: challenges[1].id,
  //       userId: users[2].id,
  //       progress: 3,
  //       completed: true,
  //       completedAt: new Date(),
  //     },
  //   }),
  // ]);

  // ==========================================
  // GAMIFICACIÓN: SWIPE CARDS (COMMENTED OUT - Models don't exist)
  // ==========================================
  // console.log('💝 Creando Swipe Cards...');
  //
  // const swipeCards = await Promise.all([
  //   prisma.swipeCard.create({
  //     data: {
  //       userId: users[2].id,
  //       userName: users[2].name,
  //       bio: users[2].bio!,
  //       avatar: users[2].avatar,
  //       interests: users[2].interests,
  //       helpOffered: ['Clases de inglés', 'Traducción'],
  //       helpNeeded: ['Reparaciones', 'Jardinería'],
  //       mutualConnections: 2,
  //     },
  //   }),
  //   prisma.swipeCard.create({
  //     data: {
  //       userId: users[4].id,
  //       userName: users[4].name,
  //       bio: users[4].bio!,
  //       avatar: users[4].avatar,
  //       interests: users[4].interests,
  //       helpOffered: ['Organización de eventos', 'DJ'],
  //       helpNeeded: ['Diseño gráfico', 'Fotografía'],
  //       mutualConnections: 1,
  //     },
  //   }),
  // ]);
  //
  // console.log(`✓ Creados ${swipeCards.length} swipe cards`);
  //
  // // Swipe actions
  // await Promise.all([
  //   prisma.swipeAction.create({
  //     data: {
  //       cardId: swipeCards[0].id,
  //       userId: users[0].id,
  //       action: 'LIKE',
  //     },
  //   }),
  //   prisma.swipeAction.create({
  //     data: {
  //       cardId: swipeCards[1].id,
  //       userId: users[0].id,
  //       action: 'SUPER_LIKE',
  //     },
  //   }),
  // ]);

  // ==========================================
  // GAMIFICACIÓN: GROUP BUYS (COMMENTED OUT - Needs proper Offer setup)
  // ==========================================
  // console.log('🛒 Creando Group Buys...');
  //
  // // First create offers for group buys
  // const groupBuyOffers = await Promise.all([
  //   prisma.offer.create({
  //     data: {
  //       userId: users[3].id,
  //       type: 'PRODUCT',
  //       category: 'Alimentos',
  //       title: 'Compra grupal de productos eco',
  //       description: 'Compra colectiva de productos ecológicos con descuento progresivo',
  //       priceEur: 20.00,
  //       lat: users[3].lat,
  //       lng: users[3].lng,
  //       address: users[3].address,
  //       status: 'ACTIVE',
  //     },
  //   }),
  //   prisma.offer.create({
  //     data: {
  //       userId: users[1].id,
  //       type: 'SERVICE',
  //       category: 'Educación',
  //       title: 'Taller grupal de carpintería',
  //       description: 'Aprende carpintería en grupo. Más personas = menos precio por persona',
  //       priceEur: 50.00,
  //       lat: users[1].lat,
  //       lng: users[1].lng,
  //       address: users[1].address,
  //       status: 'ACTIVE',
  //     },
  //   }),
  // ]);
  //
  // const groupBuys = await Promise.all([
  //   prisma.groupBuy.create({
  //     data: {
  //       offerId: groupBuyOffers[0].id,
  //       minParticipants: 5,
  //       maxParticipants: 20,
  //       currentParticipants: 8,
  //       deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  //       pickupLat: users[3].lat,
  //       pickupLng: users[3].lng,
  //       pickupAddress: users[3].address,
  //       status: 'ACTIVE',
  //     },
  //   }),
  //   prisma.groupBuy.create({
  //     data: {
  //       offerId: groupBuyOffers[1].id,
  //       minParticipants: 3,
  //       maxParticipants: 10,
  //       currentParticipants: 6,
  //       deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días
  //       pickupLat: users[1].lat,
  //       pickupLng: users[1].lng,
  //       pickupAddress: users[1].address,
  //       status: 'ACTIVE',
  //     },
  //   }),
  // ]);
  //
  // console.log(`✓ Creados ${groupBuys.length} group buys`);
  //
  // // Participantes
  // await Promise.all([
  //   prisma.groupBuyParticipant.create({
  //     data: {
  //       groupBuyId: groupBuys[0].id,
  //       userId: users[0].id,
  //       quantity: 1,
  //     },
  //   }),
  //   prisma.groupBuyParticipant.create({
  //     data: {
  //       groupBuyId: groupBuys[0].id,
  //       userId: users[1].id,
  //       quantity: 2,
  //     },
  //   }),
  //   prisma.groupBuyParticipant.create({
  //     data: {
  //       groupBuyId: groupBuys[1].id,
  //       userId: users[2].id,
  //       quantity: 1,
  //     },
  //   }),
  // ]);

  // ==========================================
  // GAMIFICACIÓN: REFERRALS (COMMENTED OUT - Needs ReferralCode model)
  // ==========================================
  // console.log('🌟 Creando Referrals...');
  //
  // // First create referral codes
  // const referralCode = await prisma.referralCode.create({
  //   data: {
  //     userId: users[0].id,
  //     code: 'MARIA2024',
  //     rewardForReferrer: 20,
  //     rewardForReferred: 20,
  //     bonusOnFirstTransaction: 10,
  //   },
  // });
  //
  // await Promise.all([
  //   prisma.referral.create({
  //     data: {
  //       codeId: referralCode.id,
  //       referredUserId: users[2].id,
  //       rewardGranted: true,
  //     },
  //   }),
  //   prisma.referral.create({
  //     data: {
  //       codeId: referralCode.id,
  //       referredUserId: users[4].id,
  //       rewardGranted: true,
  //     },
  //   }),
  // ]);
  //
  // console.log('✓ Creados referrals');

  // ==========================================
  // HYBRID LAYER: CELEBRATIONS (COMMENTED OUT - Models don't exist)
  // ==========================================
  // console.log('🎉 Creando Celebrations...');
  //
  // const celebrations = await Promise.all([
  //   prisma.layerCelebration.create({
  //     data: {
  //       userId: users[2].id,
  //       userName: users[2].name,
  //       fromLayer: 'TRADITIONAL',
  //       toLayer: 'TRANSITIONAL',
  //       reason: 'Quiero experimentar con la economía del don',
  //     },
  //   }),
  // ]);
  //
  // console.log(`✓ Creados ${celebrations.length} celebrations`);
  //
  // // Congratulations
  // await Promise.all([
  //   prisma.celebrationCongratulation.create({
  //     data: {
  //       celebrationId: celebrations[0].id,
  //       userId: users[0].id,
  //     },
  //   }),
  //   prisma.celebrationCongratulation.create({
  //     data: {
  //       celebrationId: celebrations[0].id,
  //       userId: users[1].id,
  //     },
  //   }),
  // ]);

  // ==========================================
  // HYBRID LAYER: BRIDGE EVENTS
  // ==========================================
  console.log('🌉 Creando Bridge Events...');

  const bridgeEvents = await Promise.all([
    prisma.bridgeEvent.create({
      data: {
        type: 'LAYER_EXPERIMENT',
        title: 'Semana sin dinero',
        description: 'Experimenta una semana usando solo economía del don',
        startsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // En 15 días
        endsAt: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 7 días después
        forceLayer: 'GIFT_PURE',
        participantsCount: 12,
      },
    }),
    prisma.bridgeEvent.create({
      data: {
        type: 'GIFT_DAY',
        title: 'Día de la abundancia comunitaria',
        description: 'Un día donde compartimos recursos libremente sin expectativas',
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 horas después
        forceLayer: 'GIFT_PURE',
        participantsCount: 8,
      },
    }),
  ]);

  console.log(`✓ Creados ${bridgeEvents.length} bridge events`);

  // ==========================================
  // GOVERNANCE: DELEGATION (COMMENTED OUT - Models don't exist)
  // ==========================================
  // console.log('🗳️ Creando Delegations...');
  //
  // const delegates = await Promise.all([
  //   prisma.delegate.create({
  //     data: {
  //       userId: users[0].id,
  //       userName: users[0].name,
  //       avatar: users[0].avatar,
  //       reputation: users[0].peopleHelped!,
  //       expertise: ['sostenibilidad', 'eventos', 'jardinería'],
  //       activeDelegations: 3,
  //       successRate: 92.5,
  //       bio: users[0].bio!,
  //     },
  //   }),
  //   prisma.delegate.create({
  //     data: {
  //       userId: users[1].id,
  //       userName: users[1].name,
  //       avatar: users[1].avatar,
  //       reputation: users[1].peopleHelped!,
  //       expertise: ['reparación', 'carpintería', 'bricolaje'],
  //       activeDelegations: 2,
  //       successRate: 88.0,
  //       bio: users[1].bio!,
  //     },
  //   }),
  // ]);
  //
  // console.log(`✓ Creados ${delegates.length} delegates`);
  //
  // // Delegaciones
  // await Promise.all([
  //   prisma.delegation.create({
  //     data: {
  //       delegateId: delegates[0].id,
  //       userId: users[2].id,
  //       category: 'sostenibilidad',
  //       votingPower: 10,
  //       active: true,
  //       expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
  //     },
  //   }),
  //   prisma.delegation.create({
  //     data: {
  //       delegateId: delegates[1].id,
  //       userId: users[2].id,
  //       category: 'reparación',
  //       votingPower: 5,
  //       active: true,
  //     },
  //   }),
  // ]);
  //
  // console.log('✓ Creadas delegaciones');

  // ==========================================
  // GAMIFICACIÓN: STREAKS (COMMENTED OUT - Model doesn't exist)
  // ==========================================
  // console.log('🔥 Creando Streaks...');
  //
  // await Promise.all([
  //   prisma.userStreak.create({
  //     data: {
  //       userId: users[0].id,
  //       currentStreak: 15,
  //       longestStreak: 30,
  //       lastActivityAt: new Date(),
  //       multiplier: 1.5,
  //     },
  //   }),
  //   prisma.userStreak.create({
  //     data: {
  //       userId: users[1].id,
  //       currentStreak: 7,
  //       longestStreak: 12,
  //       lastActivityAt: new Date(),
  //       multiplier: 1.2,
  //     },
  //   }),
  // ]);
  //
  // console.log('✓ Creados streaks');

  // ==========================================
  // GAMIFICACIÓN: HAPPY HOUR (COMMENTED OUT - Model doesn't exist)
  // ==========================================
  // console.log('⏰ Creando Happy Hour...');
  //
  // await prisma.happyHour.create({
  //   data: {
  //     active: true,
  //     multiplier: 2.0,
  //     startsAt: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 min
  //     endsAt: new Date(Date.now() + 90 * 60 * 1000), // En 90 min
  //     message: '¡Happy Hour activo! Gana el doble de créditos en todas las acciones',
  //   },
  // });
  //
  // console.log('✓ Creado happy hour');

  // ==========================================
  // COMUNIDADES
  // ==========================================
  console.log('🏘️  Creando comunidades...');

  const communities = await Promise.all([
    // Comunidad 1: Barrio de Gracia (Pamplona) - OPEN
    prisma.community.create({
      data: {
        slug: 'gracia-barcelona',
        name: 'Barrio de Gracia',
        description: 'Comunidad colaborativa de economía local en el corazón de Pamplona. Unidos para compartir recursos, conocimientos y crear una economía más humana.',
        location: 'Pamplona, España',
        lat: 42.8340,
        lng: -1.6234,
        radiusKm: 2.5,
        type: 'NEIGHBORHOOD',
        visibility: 'OPEN',
        requiresApproval: false,
        allowExternalOffers: true,
        primaryColor: '#4CAF50',
        language: 'es',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=400&fit=crop',
      },
    }),

    // Comunidad 2: Bermeo (Bizkaia) - OPEN
    prisma.community.create({
      data: {
        slug: 'bermeo',
        name: 'Bermeo',
        description: 'Herri honen bizilagun guztiak elkarlanean. Gure ekonomia lokala indartzeko eta harreman sozialak sendotzeko.',
        location: 'Bermeo, Bizkaia',
        lat: 43.4203,
        lng: -2.7262,
        radiusKm: 5,
        type: 'VILLAGE',
        visibility: 'OPEN',
        requiresApproval: false,
        allowExternalOffers: true,
        primaryColor: '#FF5722',
        language: 'eu',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=400&fit=crop',
      },
    }),

    // Comunidad 3: Cooperativa Sants - PRIVATE
    prisma.community.create({
      data: {
        slug: 'coop-sants',
        name: 'Cooperativa Sants',
        description: 'Cooperativa de vivienda con economía interna solidaria. Sistema de intercambio de recursos y servicios entre socios.',
        location: 'Sants, Pamplona',
        lat: 42.7815,
        lng: -1.6596,
        radiusKm: 1,
        type: 'CUSTOM',
        visibility: 'PRIVATE',
        requiresApproval: true,
        allowExternalOffers: false,
        primaryColor: '#9C27B0',
        language: 'es',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
      },
    }),

    // Comunidad 4: Uribe Kosta - FEDERATED
    prisma.community.create({
      data: {
        slug: 'uribe-kosta',
        name: 'Uribe Kosta',
        description: 'Eskualde osoa lotzen duen ekonomia-sarea. Hainbat herri federatuta ekonomia zirkularrean.',
        location: 'Uribe Kosta, Bizkaia',
        lat: 43.3833,
        lng: -2.9833,
        radiusKm: 15,
        type: 'COUNTY',
        visibility: 'FEDERATED',
        requiresApproval: false,
        allowExternalOffers: true,
        primaryColor: '#00BCD4',
        language: 'eu',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      },
    }),

    // Comunidad 5: Pamplona Centro - PUBLIC
    prisma.community.create({
      data: {
        slug: 'madrid-centro',
        name: 'Pamplona Centro',
        description: 'Red de economía colaborativa en el centro de Pamplona. Conectando vecinos, comercios y organizaciones para un futuro más sostenible.',
        location: 'Centro, Pamplona',
        lat: 42.8521,
        lng: -1.6527,
        radiusKm: 3,
        type: 'NEIGHBORHOOD',
        visibility: 'PUBLIC',
        requiresApproval: true,
        allowExternalOffers: true,
        primaryColor: '#FFC107',
        language: 'es',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=400&fit=crop',
      },
    }),

    // Comunidad 6: Mancomunidad de Andia - OPEN
    prisma.community.create({
      data: {
        slug: 'mancomunidad-andia',
        name: 'Mancomunidad de Andia',
        description: 'Herriak elkartuta ekonomia zirkularrean. Andiako mendilerroko herriak, baliabideak eta zerbitzuak partekatzen.',
        location: 'Sierra de Andía, Navarra',
        lat: 42.85,
        lng: -2.05,
        radiusKm: 12,
        type: 'COUNTY',
        visibility: 'OPEN',
        requiresApproval: false,
        allowExternalOffers: true,
        primaryColor: '#2E7D32',
        language: 'eu',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      },
    }),

    // Comunidad 7: Valdizarbe - FEDERATED
    prisma.community.create({
      data: {
        slug: 'valdizarbe',
        name: 'Valdizarbe',
        description: 'Comarca de Valdizarbe unida en economía local. Desde Artajona hasta Tafalla, compartiendo recursos y conocimientos.',
        location: 'Valdizarbe, Navarra',
        lat: 42.55,
        lng: -1.75,
        radiusKm: 18,
        type: 'COUNTY',
        visibility: 'FEDERATED',
        requiresApproval: false,
        allowExternalOffers: true,
        primaryColor: '#D32F2F',
        language: 'es',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1200&h=400&fit=crop',
      },
    }),

    // Comunidad 8: Améscoa / Ameskoa - OPEN
    prisma.community.create({
      data: {
        slug: 'ameskoa',
        name: 'Améscoa / Ameskoa',
        description: 'Ibar margaria, herri txikiak batera. Ameskoako harana, tokiko ekonomia eta elkartasuna indartuz.',
        location: 'Valle de Améscoa, Navarra',
        lat: 42.75,
        lng: -2.25,
        radiusKm: 10,
        type: 'CUSTOM',
        visibility: 'OPEN',
        requiresApproval: false,
        allowExternalOffers: true,
        primaryColor: '#558B2F',
        language: 'eu',
        currency: 'EUR',
        logo: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop',
      },
    }),
  ]);

  console.log(`✓ Creadas ${communities.length} comunidades`);

  // Asignando usuarios a comunidades
  // Nota: Los usuarios solo pueden estar en una comunidad a la vez (communityId es opcional en User)
  console.log('👥 Asignando usuarios a comunidades...');

  await Promise.all([
    // María en Pamplona Centro (fundadora)
    prisma.user.update({
      where: { id: users[0].id },
      data: { communityId: communities[4].id }, // Pamplona Centro
    }),

    // Juan en Bermeo (fundador)
    prisma.user.update({
      where: { id: users[1].id },
      data: { communityId: communities[1].id }, // Bermeo
    }),

    // Ana en Pamplona Centro (miembro)
    prisma.user.update({
      where: { id: users[2].id },
      data: { communityId: communities[4].id }, // Pamplona Centro
    }),

    // Tienda en Gracia (miembro)
    prisma.user.update({
      where: { id: users[3].id },
      data: { communityId: communities[0].id }, // Gracia
    }),

    // Carlos en Coop Sants (fundador)
    prisma.user.update({
      where: { id: users[4].id },
      data: { communityId: communities[2].id }, // Coop Sants
    }),
  ]);

  console.log('✓ Asignados usuarios a comunidades');

  // ==========================================
  // MUTUAL AID: NECESIDADES Y PROYECTOS
  // ==========================================
  console.log('\n🤝 Creando necesidades y proyectos comunitarios...');

  // Necesidades
  const needs = await Promise.all([
    // Necesidad de conocimientos - clases
    prisma.need.create({
      data: {
        creatorId: users[2].id, // Ana
        scope: 'PERSONAL',
        category: 'CHRONIC',
        type: 'EDUCATION',
        title: 'Necesito clases de español para mi hijo',
        description: 'Mi hijo de 8 años necesita apoyo con el español. Somos recién llegados y le cuesta en el colegio.',
        location: 'Pamplona Centro',
        latitude: 42.8840,
        longitude: -1.7099,
        country: 'España',
        resourceTypes: ['SKILLS', 'TIME_HOURS'],
        targetHours: 20.0,
        neededSkills: ['enseñanza', 'español', 'pedagogía'],
        urgencyLevel: 2,
        deadline: new Date('2025-12-31'),
      },
    }),

    // Necesidad de materiales
    prisma.need.create({
      data: {
        creatorId: users[4].id, // Carlos
        communityId: communities[2].id,
        scope: 'COMMUNITY',
        category: 'PROJECT',
        type: 'INFRASTRUCTURE',
        title: 'Materiales para huerto comunitario',
        description: 'Necesitamos tierra, semillas y herramientas para crear un huerto comunitario en el barrio.',
        location: 'Sants, Pamplona',
        latitude: 42.8023,
        longitude: -1.5199,
        country: 'España',
        resourceTypes: ['MATERIALS', 'EQUIPMENT', 'CREDITS'],
        targetCredits: 500,
        neededMaterials: {
          tierra: '200kg',
          semillas: 'variadas',
          herramientas: 'palas, rastrillos, regaderas',
        },
        urgencyLevel: 2,
        deadline: new Date('2025-11-30'),
      },
    }),

    // Necesidad de tiempo/voluntarios
    prisma.need.create({
      data: {
        creatorId: users[1].id, // Juan
        communityId: communities[1].id,
        scope: 'COMMUNITY',
        category: 'URGENT',
        type: 'ENVIRONMENT',
        title: 'Voluntarios para limpieza de playa',
        description: 'Organizamos limpieza de playa este sábado. Necesitamos voluntarios para recoger plásticos.',
        location: 'Bermeo',
        latitude: 42.8396,
        longitude: -1.5388,
        country: 'España',
        resourceTypes: ['TIME_HOURS'],
        targetHours: 30.0,
        urgencyLevel: 3,
        deadline: new Date('2025-11-02'),
      },
    }),

    // Necesidad de habilidades técnicas
    prisma.need.create({
      data: {
        creatorId: users[3].id, // Tienda
        scope: 'PERSONAL',
        category: 'URGENT',
        type: 'TECHNOLOGY',
        title: 'Ayuda para reparar ordenador del negocio',
        description: 'El ordenador de la caja se ha estropeado y no puedo cobrar. Necesito ayuda técnica urgente.',
        location: 'Gracia, Pamplona',
        latitude: 42.8111,
        longitude: -1.7085,
        country: 'España',
        resourceTypes: ['SKILLS'],
        neededSkills: ['informática', 'reparación'],
        urgencyLevel: 4,
        deadline: new Date('2025-10-25'),
      },
    }),

    // Necesidad local urgente de alimentos
    prisma.need.create({
      data: {
        creatorId: users[2].id, // Ana
        communityId: communities[4].id, // Pamplona Centro
        scope: 'PERSONAL',
        category: 'URGENT',
        type: 'FOOD',
        title: 'Necesito alimentos básicos para familia de 3',
        description: 'He perdido mi trabajo recientemente y necesito ayuda con alimentos básicos. Tengo 2 hijos pequeños.',
        location: 'Pamplona Centro',
        latitude: 42.8323,
        longitude: -1.7534,
        country: 'España',
        resourceTypes: ['EUR', 'CREDITS'],
        targetEur: 150.0,
        targetCredits: 300,
        urgencyLevel: 4,
        deadline: new Date('2025-11-15'),
        isVerified: true,
        verifiedBy: users[0].id,
        verifiedAt: new Date(),
      },
    }),

    // Necesidad comunitaria
    prisma.need.create({
      data: {
        communityId: communities[1].id, // Bermeo
        scope: 'COMMUNITY',
        category: 'PROJECT',
        type: 'INFRASTRUCTURE',
        title: 'Reparar frontón del pueblo',
        description: 'El frontón comunitario necesita reparaciones urgentes para seguir siendo usado por los jóvenes.',
        location: 'Bermeo, Vizcaya',
        latitude: 42.8313,
        longitude: -1.5034,
        country: 'España',
        resourceTypes: ['TIME_HOURS', 'SKILLS', 'MATERIALS'],
        targetHours: 40.0,
        neededSkills: ['albañilería', 'carpintería'],
        neededMaterials: { cemento: '20 sacos', pintura: '50 litros' },
        urgencyLevel: 3,
        deadline: new Date('2025-12-01'),
      },
    }),

    // Necesidad global
    prisma.need.create({
      data: {
        creatorId: users[0].id, // María
        scope: 'GLOBAL',
        category: 'EMERGENCY',
        type: 'WATER',
        title: 'Purificar fuente de agua contaminada en pueblo rural',
        description: 'La única fuente de agua del pueblo está contaminada. 200 familias sin acceso a agua potable.',
        location: 'Karnataka',
        latitude: 42.9162,
        longitude: -1.5379,
        country: 'India',
        resourceTypes: ['EUR', 'EQUIPMENT'],
        targetEur: 5000.0,
        urgencyLevel: 5,
        deadline: new Date('2025-11-30'),
        isVerified: true,
        verifiedBy: users[0].id,
        verifiedAt: new Date(),
      },
    }),
  ]);

  // Proyectos Comunitarios
  const projects = await Promise.all([
    // Proyecto escuela en Ghana
    prisma.communityProject.create({
      data: {
        creatorId: users[0].id, // María
        communityId: communities[4].id, // Pamplona Centro
        type: 'EDUCATION',
        title: 'Construir escuela primaria en Akosombo, Ghana',
        description: 'Proyecto para construir una escuela que beneficiará a 200 niños que actualmente no tienen acceso a educación.',
        vision: 'Educación accesible para todos los niños de la región. En 5 años queremos ver 100% de alfabetización.',
        location: 'Akosombo',
        latitude: 42.9272,
        longitude: -1.5378,
        country: 'Ghana',
        region: 'Eastern Region',
        beneficiaries: 200,
        impactGoals: [
          '200 niños con acceso a educación primaria',
          '3 profesores locales empleados',
          'Alfabetización 100% en 5 años',
        ],
        targetEur: 50000,
        targetCredits: 100000,
        targetHours: 500,
        targetSkills: ['construcción', 'carpintería', 'electricidad'],
        materialNeeds: {
          cemento: '50 sacos',
          madera: '200m',
          tejas: '500 unidades',
          pupitres: '50 unidades',
        },
        participatingCommunities: [communities[4].id],
        volunteersNeeded: 20,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        estimatedMonths: 12,
        organizationName: 'ONG Educación para Todos',
        contactEmail: 'contacto@educacion.org',
        websiteUrl: 'https://educacion.org',
        tags: ['education', 'ghana', 'school', 'children'],
        sdgGoals: [4, 10], // Educación de calidad, Reducción de desigualdades
        isVerified: true,
        verifiedBy: users[0].id,
        status: 'FUNDING',
      },
    }),

    // Proyecto agua en India
    prisma.communityProject.create({
      data: {
        creatorId: users[1].id, // Juan
        communityId: communities[1].id, // Bermeo
        type: 'WATER_SANITATION',
        title: 'Sistema de purificación de agua en 5 pueblos rurales',
        description: 'Instalar sistemas de purificación de agua en 5 pueblos que actualmente no tienen acceso a agua potable.',
        vision: 'Agua limpia y segura para 500 familias, reduciendo enfermedades transmitidas por agua.',
        location: 'Karnataka',
        latitude: 42.7304,
        longitude: -1.6290,
        country: 'India',
        region: 'Karnataka',
        beneficiaries: 500,
        impactGoals: [
          '500 familias con acceso a agua potable',
          'Reducción 80% de enfermedades hídricas',
          '500,000 litros de agua limpia por año',
        ],
        targetEur: 10000,
        targetCredits: 20000,
        targetHours: 200,
        targetSkills: ['plomería', 'ingeniería'],
        materialNeeds: {
          filtros: '5 unidades industriales',
          tuberias: '1000m',
          tanques: '5 unidades 1000L',
        },
        participatingCommunities: [communities[1].id, communities[4].id],
        volunteersNeeded: 15,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-06-30'),
        estimatedMonths: 8,
        organizationName: 'Agua Limpia Internacional',
        contactEmail: 'info@agualimpia.org',
        websiteUrl: 'https://agualimpia.org',
        tags: ['water', 'health', 'sanitation', 'india'],
        sdgGoals: [6, 3], // Agua limpia, Salud y bienestar
        isVerified: true,
        verifiedBy: users[0].id,
        status: 'FUNDING',
      },
    }),

    // Auzolan en Navarra
    prisma.communityProject.create({
      data: {
        creatorId: users[1].id, // Juan
        communityId: communities[1].id, // Bermeo
        type: 'AUZOLAN',
        title: 'Auzolan para reparar frontón comunitario',
        description: 'Trabajo comunitario tradicional para reparar el frontón del pueblo. Todos los vecinos están invitados a participar.',
        vision: 'Recuperar nuestro espacio de encuentro y deporte, fortaleciendo los lazos comunitarios.',
        location: 'Bermeo, Vizcaya',
        latitude: 42.8476,
        longitude: -1.7184,
        country: 'España',
        region: 'País Vasco',
        beneficiaries: 100,
        impactGoals: [
          'Frontón reparado y funcional',
          '100 personas del pueblo beneficiadas',
          'Tradición del auzolan mantenida',
        ],
        targetHours: 40,
        targetSkills: ['albañilería', 'carpintería', 'pintura'],
        materialNeeds: {
          cemento: '20 sacos',
          pintura: '50 litros',
          madera: '20m',
        },
        participatingCommunities: [communities[1].id],
        volunteersNeeded: 15,
        volunteersEnrolled: 8,
        startDate: new Date('2025-11-05'),
        endDate: new Date('2025-11-05'),
        estimatedMonths: 0,
        tags: ['auzolan', 'navarra', 'tradition', 'community'],
        sdgGoals: [11], // Ciudades y comunidades sostenibles
        status: 'READY',
      },
    }),
  ]);

  // Contribuciones de ejemplo
  const contributions = await Promise.all([
    // María contribuye a necesidad de Ana
    prisma.contribution.create({
      data: {
        userId: users[0].id, // María
        needId: needs[0].id,
        contributionType: 'MONETARY',
        amountCredits: 100,
        message: 'Te ayudo con gusto, vecina. Ánimo!',
        status: 'COMPLETED',
        validatedAt: new Date(),
        validatedBy: users[2].id,
      },
    }),

    // Juan contribuye al proyecto de Ghana
    prisma.contribution.create({
      data: {
        userId: users[1].id, // Juan
        projectId: projects[0].id,
        contributionType: 'MONETARY',
        amountEur: 100,
        message: 'Desde Bermeo apoyamos la educación en Ghana',
        status: 'COMPLETED',
        validatedAt: new Date(),
        validatedBy: users[0].id,
      },
    }),

    // Carlos ofrece habilidades para el auzolan
    prisma.contribution.create({
      data: {
        userId: users[4].id, // Carlos
        projectId: projects[2].id,
        contributionType: 'SKILLS',
        amountHours: 4,
        skillsOffered: ['carpintería', 'albañilería'],
        message: 'Cuenten conmigo para el auzolan!',
        status: 'PENDING',
      },
    }),
  ]);

  // Actualizar amounts en necesidades y proyectos
  await Promise.all([
    prisma.need.update({
      where: { id: needs[0].id },
      data: {
        currentCredits: 100,
        contributorsCount: 1,
      },
    }),
    prisma.communityProject.update({
      where: { id: projects[0].id },
      data: {
        currentEur: 100,
        contributorsCount: 1,
      },
    }),
    prisma.communityProject.update({
      where: { id: projects[2].id },
      data: {
        currentHours: 4,
        contributorsCount: 1,
        volunteersEnrolled: 9,
      },
    }),
  ]);

  // Actualización de proyecto
  const projectUpdate = await prisma.projectUpdate.create({
    data: {
      projectId: projects[0].id,
      authorId: users[0].id,
      title: '¡Hemos alcanzado 100€!',
      content: 'Gracias a Juan de Bermeo por la primera contribución. Sigamos así!',
      progressUpdate: 0.002,
      fundsUsed: 0,
      beneficiariesReached: 0,
      milestones: ['Primera contribución recibida'],
      nextSteps: 'Continuar difundiendo el proyecto',
    },
  });

  console.log('✓ Necesidades y proyectos creados');
  console.log(`   • ${needs.length} necesidades`);
  console.log(`   • ${projects.length} proyectos comunitarios`);
  console.log(`   • ${contributions.length} contribuciones`);

  // ==========================================
  // HOUSING: SOLUCIONES DE VIVIENDA
  // ==========================================
  console.log('\n🏠 Creando soluciones de vivienda...');

  // 1. SpaceBank - Banco de Espacios
  const spaceBanks = await Promise.all([
    prisma.spaceBank.create({
      data: {
        ownerId: users[4].id, // Carlos
        communityId: communities[0].id, // Gracia
        type: 'ROOM',
        title: 'Habitación en piso compartido - Gracia',
        description: 'Habitación individual en piso compartido. Ideal para estudiantes o viajeros. Ambiente colaborativo y respetuoso.',
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
        address: 'Carrer de Verdi, 45, Gracia, Pamplona',
        lat: 42.8269,
        lng: -1.6559,
        capacity: 1,
        squareMeters: 12,
        features: ['Ventana exterior', 'Luz natural', 'Calefacción'],
        equipment: ['Cama', 'Escritorio', 'Armario', 'Silla'],
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        availableHours: { start: '00:00', end: '23:59' },
        minBookingHours: 168, // 7 días
        maxBookingHours: 2160, // 90 días
        exchangeType: 'MIXED',
        pricePerHour: 0.5,
        creditsPerHour: 2,
        hoursPerHour: 1,
        rules: ['No fumar', 'Respetar horarios de descanso', 'Limpiar espacios comunes'],
        status: 'ACTIVE',
      },
    }),

    prisma.spaceBank.create({
      data: {
        ownerId: users[2].id, // Ana
        type: 'ROOM',
        title: 'Habitación para estudiantes de intercambio',
        description: 'Habitación disponible para estudiantes que vienen a Pamplona. Intercambio cultural y apoyo mutuo.',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        address: 'Calle Alcalá, 123, Pamplona',
        lat: 42.7818,
        lng: -1.5975,
        capacity: 1,
        squareMeters: 10,
        features: ['WiFi rápido', 'Escritorio amplio', 'Luz natural'],
        equipment: ['Cama', 'Escritorio', 'Armario', 'Lámpara de escritorio'],
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        availableHours: { start: '00:00', end: '23:59' },
        minBookingHours: 336, // 14 días
        maxBookingHours: 2880, // 120 días
        exchangeType: 'TIME_HOURS',
        hoursPerHour: 1,
        rules: ['Compartir cenas comunitarias 1 vez/semana', 'No ruido después de 23h', 'Limpieza semanal'],
        status: 'ACTIVE',
      },
    }),
  ]);

  // 2. TemporaryHousing - Vivienda Temporal
  const temporaryHousings = await Promise.all([
    prisma.temporaryHousing.create({
      data: {
        hostId: users[0].id, // María
        communityId: communities[4].id, // Pamplona Centro
        type: 'EMERGENCY',
        title: 'Vivienda de emergencia para familias',
        description: 'Piso disponible para familias en situación de vulnerabilidad temporal. Acompañamiento social incluido.',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
        address: 'Calle Gran Vía, 55, Pamplona Centro',
        lat: 42.9695,
        lng: -1.6965,
        accommodationType: 'ENTIRE_PLACE',
        beds: 3,
        bathrooms: 1,
        squareMeters: 70,
        amenities: ['Totalmente amueblado', 'Calefacción', 'Electrodomésticos', 'Cerca de colegios', 'WiFi', 'Cocina equipada'],
        houseRules: ['Participar en reuniones semanales', 'Colaborar con limpieza', 'Buscar activamente empleo/vivienda'],
        availableFrom: new Date('2025-01-01'),
        availableTo: new Date('2025-12-31'),
        minNights: 30,
        maxNights: 180,
        exchangeType: 'EUR',
        pricePerNight: 5,
        minReputation: 0,
        requiresApproval: true,
        maxGuests: 4,
        status: 'ACTIVE',
      },
    }),
  ]);

  // 3. HousingCoop - Cooperativa de Vivienda
  const housingCoops = await Promise.all([
    prisma.housingCoop.create({
      data: {
        communityId: communities[2].id, // Coop Sants
        name: 'La Borda 2.0',
        description: 'Proyecto de cooperativa de vivienda en cesión de uso. Propiedad colectiva, gestión democrática.',
        vision: '40 viviendas en régimen de cesión de uso, espacios comunes amplios, arquitectura sostenible y comunidad activa',
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
        type: 'COHOUSING',
        address: 'Carrer de la Constitució, 85, Sants, Pamplona',
        lat: 42.7185,
        lng: -1.6939,
        locationConfirmed: true,
        minMembers: 30,
        maxMembers: 40,
        currentMembers: 2,
        totalBudget: 6000000,
        currentFunds: 360000,
        monthlyContribution: 600,
        governance: 'QUADRATIC_VOTING',
        decisionThreshold: 0.66,
        sharedSpaces: ['sala polivalente', 'lavandería comunitaria', 'huerto urbano', 'azotea', 'taller'],
        privateSpaces: ['40 viviendas', 'balcones privados'],
        communityRules: [
          'Participar en asambleas mensuales',
          'Contribuir 3 horas/mes en tareas comunitarias',
          'Respetar decisiones de la asamblea',
          'Mantener espacios comunes',
        ],
        entryCriteria: {
          initialContribution: 15000,
          minimumStay: '5 años',
          activeParticipation: true,
        },
        phase: 'FUNDING',
        targetMoveIn: new Date('2027-01-01'),
        status: 'OPEN',
      },
    }),
  ]);

  // Miembros de cooperativa
  const coopMembers = await Promise.all([
    prisma.housingCoopMember.create({
      data: {
        coopId: housingCoops[0].id,
        userId: users[4].id, // Carlos
        role: 'FOUNDER',
        status: 'ACTIVE',
        monthlyContribution: 600,
        contributionType: 'EUR',
        totalContributed: 18000,
        commitmentLevel: 'full-time',
        skills: ['Arquitectura', 'Gestión de proyectos', 'Facilitación de asambleas'],
        applicationMessage: 'Fundador del proyecto, con experiencia en cooperativas de vivienda',
        joinedAt: new Date('2025-01-15'),
      },
    }),

    prisma.housingCoopMember.create({
      data: {
        coopId: housingCoops[0].id,
        userId: users[0].id, // María
        role: 'MEMBER',
        status: 'ACTIVE',
        monthlyContribution: 600,
        contributionType: 'EUR',
        totalContributed: 15600,
        commitmentLevel: 'full-time',
        skills: ['Contabilidad', 'Comunicación', 'Redes sociales'],
        applicationMessage: 'Busco vivir en comunidad con valores de cooperación',
        joinedAt: new Date('2025-02-01'),
      },
    }),
  ]);

  // 4. CommunityGuarantee - Aval Comunitario
  const communityGuarantees = await Promise.all([
    prisma.communityGuarantee.create({
      data: {
        userId: users[2].id, // Ana solicita el aval
        communityId: communities[1].id, // Bermeo
        landlordName: 'Propiedades Bermeo S.L.',
        landlordEmail: 'contacto@propiedadesbermeo.com',
        landlordPhone: '+34 944 123 456',
        propertyAddress: 'Calle Euskalherria, 23, Bermeo',
        monthlyRent: 650,
        coverageMonths: 3,
        maxCoverage: 1950,
        reputation: 85,
        status: 'ACTIVE',
        fundAllocated: 1950,
        activatedAt: new Date('2025-09-01'),
        expiresAt: new Date('2026-09-01'),
      },
    }),
  ]);

  // Supporters del aval comunitario
  const guaranteeSupporters = await Promise.all([
    prisma.guaranteeSupporter.create({
      data: {
        guaranteeId: communityGuarantees[0].id,
        supporterId: users[1].id, // Juan
        monthsCommitted: 12,
        amountCommitted: 1000,
        status: 'ACTIVE',
      },
    }),

    prisma.guaranteeSupporter.create({
      data: {
        guaranteeId: communityGuarantees[0].id,
        supporterId: users[4].id, // Carlos
        monthsCommitted: 6,
        amountCommitted: 500,
        status: 'ACTIVE',
      },
    }),

    prisma.guaranteeSupporter.create({
      data: {
        guaranteeId: communityGuarantees[0].id,
        supporterId: users[0].id, // María
        monthsCommitted: 6,
        amountCommitted: 450,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('✓ Soluciones de vivienda creadas');
  console.log(`   • ${spaceBanks.length} bancos de espacios`);
  console.log(`   • ${temporaryHousings.length} viviendas temporales`);
  console.log(`   • ${housingCoops.length} cooperativas de vivienda`);
  console.log(`   • ${coopMembers.length} miembros de cooperativa`);
  console.log(`   • ${communityGuarantees.length} avales comunitarios`);
  console.log(`   • ${guaranteeSupporters.length} supporters de avales`);

  // ==========================================
  // RESUMEN
  // ==========================================
  console.log('\n✅ ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`   • ${users.length} usuarios`);
  console.log(`   • ${offers.length} ofertas`);
  console.log(`   • ${timeBankOffers.length} ofertas de banco de tiempo`);
  console.log(`   • ${timeBankTransactions.length} transacciones de banco de tiempo`);
  console.log(`   • ${events.length} eventos`);
  console.log(`   • ${posts.length} posts`);
  console.log(`   • ${blocks.length} trust blocks`);
  console.log(`   • ${proposals.length} propuestas de consenso`);
  console.log('\n🦎 Sistema Híbrido:');
  console.log(`   • ${bridgeEvents.length} bridge events programados`);
  console.log('\n🏘️  Comunidades:');
  console.log(`   • ${communities.length} comunidades creadas`);
  console.log(`   • 5 usuarios asignados a comunidades`);
  console.log('\n👥 Usuarios de prueba (todos con contraseña: Test1234!):');
  console.log('   • maria@comunidad.local     - Validador Experto (120 ayudas) - Pamplona Centro');
  console.log('   • juan@comunidad.local      - Validador Activo (55 ayudas) - Bermeo');
  console.log('   • ana@comunidad.local       - Usuario Nuevo (8 ayudas) - Pamplona Centro');
  console.log('   • tienda@comunidad.local    - Comercio Local - Gracia');
  console.log('   • carlos@comunidad.local    - Organizador de Eventos - Coop Sants');
  console.log('\n🌐 Pruébalo en: http://localhost:3000');
  console.log('📚 API Docs: http://localhost:4000/api/docs');
  console.log('🛠️  Dev Tools: http://localhost:3000/dev\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
