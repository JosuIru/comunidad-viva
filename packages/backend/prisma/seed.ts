import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos de prueba...');

  // Limpiar datos existentes usando TRUNCATE CASCADE (más rápido y evita problemas de foreign keys)
  console.log('🗑️  Limpiando datos existentes...');

  // Usar SQL raw para truncate en cascade (PostgreSQL)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');

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
        lat: 40.4168,
        lng: -3.7038,
        address: 'Calle Mayor 15, Madrid',
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
        lat: 40.4200,
        lng: -3.7050,
        address: 'Plaza España 8, Madrid',
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
        lat: 40.4150,
        lng: -3.7000,
        address: 'Calle Alcalá 42, Madrid',
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
        lat: 40.4180,
        lng: -3.7020,
        address: 'Calle Preciados 25, Madrid',
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
        lat: 40.4190,
        lng: -3.7060,
        address: 'Gran Vía 30, Madrid',
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
        lat: 40.4170,
        lng: -3.7030,
        address: 'Plaza del Carmen, Madrid',
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
        lat: 40.4160,
        lng: -3.7010,
        address: 'Centro Comunitario Lavapiés',
        tags: ['sostenibilidad', 'compostaje', 'taller'],
        status: 'ACTIVE',
        views: 60,
        interested: 15,
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
        lat: 40.4170,
        lng: -3.7030,
        address: 'Plaza del Carmen, Madrid',
        startsAt: new Date('2024-11-15T10:00:00Z'),
        endsAt: new Date('2024-11-15T14:00:00Z'),
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
        lat: 40.4160,
        lng: -3.7010,
        address: 'Centro Comunitario Lavapiés',
        startsAt: new Date('2024-11-20T17:00:00Z'),
        endsAt: new Date('2024-11-20T19:00:00Z'),
        capacity: 20,
        type: 'WORKSHOP',
        tags: ['sostenibilidad', 'compostaje', 'taller'],
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
        discussionDeadline: new Date('2024-11-10T23:59:59Z'),
        votingDeadline: new Date('2024-11-15T23:59:59Z'),
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
    // Comunidad 1: Barrio de Gracia (Barcelona) - OPEN
    prisma.community.create({
      data: {
        slug: 'gracia-barcelona',
        name: 'Barrio de Gracia',
        description: 'Comunidad colaborativa de economía local en el corazón de Barcelona. Unidos para compartir recursos, conocimientos y crear una economía más humana.',
        location: 'Barcelona, España',
        lat: 41.4036,
        lng: 2.1589,
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
        location: 'Sants, Barcelona',
        lat: 41.3750,
        lng: 2.1372,
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

    // Comunidad 5: Madrid Centro - PUBLIC
    prisma.community.create({
      data: {
        slug: 'madrid-centro',
        name: 'Madrid Centro',
        description: 'Red de economía colaborativa en el centro de Madrid. Conectando vecinos, comercios y organizaciones para un futuro más sostenible.',
        location: 'Centro, Madrid',
        lat: 40.4168,
        lng: -3.7038,
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
  ]);

  console.log(`✓ Creadas ${communities.length} comunidades`);

  // Asignando usuarios a comunidades
  // Nota: Los usuarios solo pueden estar en una comunidad a la vez (communityId es opcional en User)
  console.log('👥 Asignando usuarios a comunidades...');

  await Promise.all([
    // María en Madrid Centro (fundadora)
    prisma.user.update({
      where: { id: users[0].id },
      data: { communityId: communities[4].id }, // Madrid Centro
    }),

    // Juan en Bermeo (fundador)
    prisma.user.update({
      where: { id: users[1].id },
      data: { communityId: communities[1].id }, // Bermeo
    }),

    // Ana en Madrid Centro (miembro)
    prisma.user.update({
      where: { id: users[2].id },
      data: { communityId: communities[4].id }, // Madrid Centro
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
  console.log('   • maria@comunidad.local     - Validador Experto (120 ayudas) - Madrid Centro');
  console.log('   • juan@comunidad.local      - Validador Activo (55 ayudas) - Bermeo');
  console.log('   • ana@comunidad.local       - Usuario Nuevo (8 ayudas) - Madrid Centro');
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
