import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo de datos de prueba...');

  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "Community" CASCADE');
  console.log('✓ Base de datos limpiada');

  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // ==========================================
  // USUARIOS DE PRUEBA
  // ==========================================
  console.log('👥 Creando usuarios...');

  const user1 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'maria@comunidad.local',
      password: hashedPassword,
      name: 'María García',
      bio: 'Activista comunitaria, organizadora de eventos locales. Me encanta ayudar a los vecinos.',
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
      updatedAt: now,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'juan@comunidad.local',
      password: hashedPassword,
      name: 'Juan Martínez',
      bio: 'Carpintero y manitas. Ofrezco reparaciones y clases de bricolaje.',
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
      updatedAt: now,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'ana@comunidad.local',
      password: hashedPassword,
      name: 'Ana López',
      bio: 'Profesora de idiomas. Ofrezco clases de inglés y francés.',
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
      interests: ['idiomas', 'educación'],
      weeklyMood: 'LEARNING',
      updatedAt: now,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'carlos@comunidad.local',
      password: hashedPassword,
      name: 'Carlos Ruiz',
      bio: 'Desarrollador web y entusiasta de la tecnología comunitaria.',
      role: 'CITIZEN',
      lat: 42.9650,
      lng: -1.7320,
      address: 'Avenida de Navarra 25, Pamplona',
      neighborhood: 'Centro',
      credits: 120,
      level: 2,
      experience: 450,
      peopleHelped: 25,
      hoursShared: 60,
      hoursReceived: 15,
      totalSaved: 210,
      co2Avoided: 30,
      voteCredits: 20,
      interests: ['tecnología', 'programación', 'educación'],
      weeklyMood: 'ORGANIZING',
      updatedAt: now,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'admin@comunidad.local',
      password: hashedPassword,
      name: 'Administrador',
      bio: 'Cuenta de administración del sistema',
      role: 'ADMIN',
      lat: 42.9940,
      lng: -1.7217,
      address: 'Centro de Administración, Pamplona',
      neighborhood: 'Centro',
      credits: 1000,
      level: 10,
      experience: 5000,
      interests: ['administración'],
      updatedAt: now,
    },
  });

  console.log('✓ Usuarios creados:', [user1.email, user2.email, user3.email, user4.email, adminUser.email]);

  // ==========================================
  // COMUNIDAD DE PRUEBA
  // ==========================================
  console.log('🏘️  Creando comunidad...');

  const community = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'pamplona-centro',
      name: 'Pamplona Centro',
      description: 'Comunidad de economía colaborativa del centro de Pamplona',
      type: 'NEIGHBORHOOD',
      visibility: 'PUBLIC',
      lat: 42.9940,
      lng: -1.7217,
      radiusKm: 5,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Agregar usuarios a la comunidad
  await Promise.all([
    prisma.user.update({ where: { id: user1.id }, data: { communityId: community.id } }),
    prisma.user.update({ where: { id: user2.id }, data: { communityId: community.id } }),
    prisma.user.update({ where: { id: user3.id }, data: { communityId: community.id } }),
    prisma.user.update({ where: { id: user4.id }, data: { communityId: community.id } }),
    prisma.user.update({ where: { id: adminUser.id }, data: { communityId: community.id } }),
  ]);

  console.log('✓ Comunidad creada y usuarios asignados:', community.name);

  // ==========================================
  // CONEXIONES ENTRE USUARIOS
  // ==========================================
  console.log('🤝 Creando conexiones...');

  await Promise.all([
    prisma.connection.create({
      data: {
        id: randomUUID(),
        userId: user1.id,
        connectedId: user2.id,
        type: 'FRIEND',
        strength: 5,
        createdAt: now,
      },
    }),
    prisma.connection.create({
      data: {
        id: randomUUID(),
        userId: user2.id,
        connectedId: user1.id,
        type: 'FRIEND',
        strength: 5,
        createdAt: now,
      },
    }),
    prisma.connection.create({
      data: {
        id: randomUUID(),
        userId: user1.id,
        connectedId: user3.id,
        type: 'FRIEND',
        strength: 3,
        createdAt: now,
      },
    }),
    prisma.connection.create({
      data: {
        id: randomUUID(),
        userId: user3.id,
        connectedId: user1.id,
        type: 'FRIEND',
        strength: 3,
        createdAt: now,
      },
    }),
  ]);

  console.log('✓ Conexiones creadas');

  // ==========================================
  // HABILIDADES (SKILLS)
  // ==========================================
  console.log('💪 Creando habilidades...');

  const skill1 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      category: 'Jardinería',
      name: 'Jardinería urbana',
      description: 'Cultivo de huertos urbanos y cuidado de plantas',
      verified: true,
      endorsements: 8,
    },
  });

  const skill2 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      category: 'Carpintería',
      name: 'Reparación de muebles',
      description: 'Restauración y reparación de muebles de madera',
      verified: true,
      endorsements: 12,
    },
  });

  const skill3 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user3.id,
      category: 'Idiomas',
      name: 'Enseñanza de inglés',
      description: 'Clases de inglés para todos los niveles',
      verified: false,
      endorsements: 5,
    },
  });

  const skill4 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user4.id,
      category: 'Tecnología',
      name: 'Desarrollo web',
      description: 'Creación de sitios web y aplicaciones',
      verified: true,
      endorsements: 10,
    },
  });

  console.log('✓ Habilidades creadas');

  // ==========================================
  // OFERTAS DE SERVICIOS
  // ==========================================
  console.log('💼 Creando ofertas de servicios...');

  const offer1 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      type: 'SERVICE',
      category: 'Educación',
      title: 'Clases de jardinería urbana',
      description: 'Enseño técnicas de jardinería para espacios pequeños. Aprende a cultivar tus propias verduras en casa.',
      priceCredits: 10,
      lat: 42.9940,
      lng: -1.7217,
      address: 'Calle Mayor 15, Pamplona',
      communityId: community.id,
      tags: ['jardinería', 'educación', 'sostenibilidad'],
      status: 'ACTIVE',
      views: 45,
      interested: 8,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      type: 'SERVICE',
      category: 'Hogar',
      title: 'Reparaciones de carpintería',
      description: 'Reparo muebles y hago trabajos de carpintería básica. Presupuesto sin compromiso.',
      priceCredits: 15,
      lat: 42.8931,
      lng: -1.6322,
      address: 'Plaza España 8, Pamplona',
      communityId: community.id,
      tags: ['carpintería', 'reparación', 'hogar'],
      status: 'ACTIVE',
      views: 62,
      interested: 12,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer3 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user3.id,
      type: 'SERVICE',
      category: 'Educación',
      title: 'Clases de inglés conversacional',
      description: 'Práctica de conversación en inglés, todos los niveles. Ambiente relajado y amigable.',
      priceCredits: 8,
      lat: 42.9701,
      lng: -1.7545,
      address: 'Calle Alcalá 42, Pamplona',
      communityId: community.id,
      tags: ['idiomas', 'inglés', 'educación'],
      status: 'ACTIVE',
      views: 38,
      interested: 6,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer4 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user4.id,
      type: 'SERVICE',
      category: 'Tecnología',
      title: 'Ayuda con tecnología y ordenadores',
      description: 'Resuelvo problemas técnicos, instalo programas, enseño a usar aplicaciones.',
      priceCredits: 12,
      lat: 42.9650,
      lng: -1.7320,
      address: 'Avenida de Navarra 25, Pamplona',
      communityId: community.id,
      tags: ['tecnología', 'informática', 'ayuda'],
      status: 'ACTIVE',
      views: 28,
      interested: 5,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Oferta de producto para GroupBuy
  const offer5 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      type: 'PRODUCT',
      category: 'Alimentos',
      title: 'Tomates ecológicos del huerto comunitario',
      description: 'Tomates cultivados sin pesticidas en nuestro huerto comunitario. ¡Más barato comprando en grupo!',
      priceCredits: 5,
      priceEur: 3.50,
      stock: 50,
      lat: 42.9940,
      lng: -1.7217,
      address: 'Huerto Comunitario, Calle Mayor 15, Pamplona',
      communityId: community.id,
      tags: ['alimentos', 'ecológico', 'local'],
      status: 'ACTIVE',
      views: 75,
      interested: 15,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✓ Ofertas creadas');

  // ==========================================
  // COMPRA GRUPAL (GROUP BUY)
  // ==========================================
  console.log('🛒 Creando compra grupal...');

  const groupBuy = await prisma.groupBuy.create({
    data: {
      id: randomUUID(),
      offerId: offer5.id,
      minParticipants: 5,
      maxParticipants: 20,
      currentParticipants: 3,
      deadline: nextWeek,
      pickupLat: 42.9940,
      pickupLng: -1.7217,
      pickupAddress: 'Huerto Comunitario, Calle Mayor 15, Pamplona',
      status: 'ACTIVE',
      createdAt: now,
    },
  });

  // Participantes en la compra grupal
  await Promise.all([
    prisma.groupBuyParticipant.create({
      data: {
        id: randomUUID(),
        groupBuyId: groupBuy.id,
        userId: user2.id,
        quantity: 2,
        joinedAt: now,
      },
    }),
    prisma.groupBuyParticipant.create({
      data: {
        id: randomUUID(),
        groupBuyId: groupBuy.id,
        userId: user3.id,
        quantity: 3,
        joinedAt: now,
      },
    }),
    prisma.groupBuyParticipant.create({
      data: {
        id: randomUUID(),
        groupBuyId: groupBuy.id,
        userId: user4.id,
        quantity: 1,
        joinedAt: now,
      },
    }),
  ]);

  console.log('✓ Compra grupal creada');

  // ==========================================
  // EVENTOS
  // ==========================================
  console.log('📅 Creando eventos...');

  const event1 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user1.id,
      title: 'Taller de compostaje comunitario',
      description: 'Aprende a hacer compost casero y ayuda a reducir residuos orgánicos en tu hogar.',
      lat: 42.9940,
      lng: -1.7217,
      address: 'Huerto Comunitario, Calle Mayor 15, Pamplona',
      startsAt: tomorrow,
      endsAt: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      capacity: 20,
      creditsReward: 5,
      tags: ['sostenibilidad', 'medio ambiente', 'educación'],
      type: 'WORKSHOP',
      requirements: [],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user2.id,
      title: 'Reparación colectiva de muebles',
      description: 'Trae tus muebles estropeados y aprende a repararlos. Herramientas y materiales básicos proporcionados.',
      lat: 42.8931,
      lng: -1.6322,
      address: 'Centro Comunitario, Plaza España 8, Pamplona',
      startsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 15,
      creditsReward: 10,
      tags: ['bricolaje', 'reparación', 'economía circular'],
      type: 'WORKSHOP',
      requirements: ['Traer tu mueble a reparar'],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: adminUser.id,
      title: 'Asamblea mensual de la comunidad',
      description: 'Reunión mensual para discutir propuestas, compartir ideas y tomar decisiones colectivas.',
      lat: 42.9940,
      lng: -1.7217,
      address: 'Centro Cívico, Pamplona',
      startsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      creditsReward: 3,
      tags: ['asamblea', 'gobernanza', 'comunidad'],
      type: 'SOCIAL',
      requirements: [],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  // Asistentes a eventos
  await Promise.all([
    prisma.eventAttendee.create({
      data: {
        id: randomUUID(),
        eventId: event1.id,
        userId: user2.id,
        role: 'PARTICIPANT',
        registeredAt: now,
      },
    }),
    prisma.eventAttendee.create({
      data: {
        id: randomUUID(),
        eventId: event1.id,
        userId: user3.id,
        role: 'PARTICIPANT',
        registeredAt: now,
      },
    }),
    prisma.eventAttendee.create({
      data: {
        id: randomUUID(),
        eventId: event2.id,
        userId: user1.id,
        role: 'PARTICIPANT',
        registeredAt: now,
      },
    }),
  ]);

  console.log('✓ Eventos creados');

  // ==========================================
  // PUBLICACIONES (POSTS)
  // ==========================================
  console.log('📝 Creando publicaciones...');

  const post1 = await prisma.post.create({
    data: {
      id: randomUUID(),
      authorId: user1.id,
      content: '¡Acabo de terminar el taller de compostaje! Aprendí muchísimo sobre cómo reducir residuos orgánicos. ¿Alguien más interesado en sostenibilidad? 🌱',
      type: 'STORY',
      visibility: 'PUBLIC',
      tags: ['sostenibilidad', 'compostaje'],
      mentions: [],
      thanksCount: 5,
      supportsCount: 3,
      commentsCount: 2,
      createdAt: now,
      updatedAt: now,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      id: randomUUID(),
      authorId: user2.id,
      content: 'Reparé una silla antigua hoy. ¡Quedó como nueva! Me encanta darle nueva vida a los muebles. Si alguien necesita ayuda con reparaciones, aquí estoy 🔨',
      type: 'STORY',
      visibility: 'PUBLIC',
      tags: ['bricolaje', 'reparación', 'economía circular'],
      mentions: [],
      thanksCount: 8,
      supportsCount: 6,
      commentsCount: 3,
      relatedOfferId: offer2.id,
      createdAt: now,
      updatedAt: now,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      id: randomUUID(),
      authorId: user3.id,
      content: 'Busco personas para practicar inglés. ¡Es más divertido en grupo! ☕',
      type: 'NEED',
      visibility: 'PUBLIC',
      tags: ['idiomas', 'inglés'],
      mentions: [],
      thanksCount: 2,
      supportsCount: 4,
      commentsCount: 5,
      relatedOfferId: offer3.id,
      createdAt: now,
      updatedAt: now,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      id: randomUUID(),
      authorId: user4.id,
      content: '¡Los tomates del huerto comunitario están listos! 🍅 Únete a la compra grupal para conseguir un mejor precio.',
      type: 'OFFER',
      visibility: 'PUBLIC',
      tags: ['alimentos', 'local', 'ecológico'],
      mentions: [],
      thanksCount: 10,
      supportsCount: 7,
      commentsCount: 4,
      relatedOfferId: offer5.id,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Comentarios en posts
  await Promise.all([
    prisma.comment.create({
      data: {
        id: randomUUID(),
        postId: post1.id,
        authorId: user2.id,
        content: '¡Qué interesante! Yo también quiero aprender',
        createdAt: now,
      },
    }),
    prisma.comment.create({
      data: {
        id: randomUUID(),
        postId: post2.id,
        authorId: user1.id,
        content: '¡Te quedó genial! ¿Podrías ayudarme con una mesa?',
        createdAt: now,
      },
    }),
  ]);

  console.log('✓ Publicaciones creadas');

  // ==========================================
  // DESAFÍOS SEMANALES
  // ==========================================
  console.log('🏆 Creando desafíos semanales...');

  const challenge1 = await prisma.weeklyChallenge.create({
    data: {
      id: randomUUID(),
      type: 'HELP_NEIGHBORS',
      title: 'Ayuda a 3 vecinos esta semana',
      description: 'Completa 3 intercambios de ayuda con miembros de tu comunidad',
      targetValue: 3,
      reward: 50,
      bonusFirst: 100,
      participants: 2,
      startsAt: now,
      endsAt: nextWeek,
      createdAt: now,
    },
  });

  const challenge2 = await prisma.weeklyChallenge.create({
    data: {
      id: randomUUID(),
      type: 'SHARE_HOURS',
      title: 'Comparte 5 horas de tu tiempo',
      description: 'Dedica 5 horas a ayudar a otros en la comunidad',
      targetValue: 5,
      reward: 75,
      bonusFirst: 150,
      participants: 1,
      startsAt: now,
      endsAt: nextWeek,
      createdAt: now,
    },
  });

  // Participantes en desafíos
  await Promise.all([
    prisma.challengeParticipant.create({
      data: {
        id: randomUUID(),
        challengeId: challenge1.id,
        userId: user1.id,
        progress: 2,
        completed: false,
        createdAt: now,
      },
    }),
    prisma.challengeParticipant.create({
      data: {
        id: randomUUID(),
        challengeId: challenge1.id,
        userId: user2.id,
        progress: 3,
        completed: true,
        completedAt: now,
        createdAt: now,
      },
    }),
  ]);

  console.log('✓ Desafíos semanales creados');

  // ==========================================
  // RESEÑAS (REVIEWS)
  // ==========================================
  console.log('⭐ Creando reseñas...');

  await Promise.all([
    prisma.review.create({
      data: {
        id: randomUUID(),
        reviewerId: user2.id,
        reviewType: 'USER',
        reviewedEntityId: user1.id,
        rating: 5,
        comment: 'Excelente profesora de jardinería. Muy paciente y con muchos conocimientos.',
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        reviewerId: user1.id,
        reviewType: 'USER',
        reviewedEntityId: user2.id,
        rating: 5,
        comment: 'Juan reparó mi estantería de forma impecable. ¡Muy recomendable!',
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        reviewerId: user3.id,
        reviewType: 'USER',
        reviewedEntityId: user1.id,
        rating: 4,
        comment: 'Aprendí mucho en sus clases. Muy amable y profesional.',
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.review.create({
      data: {
        id: randomUUID(),
        reviewerId: user4.id,
        reviewType: 'USER',
        reviewedEntityId: user2.id,
        rating: 5,
        comment: 'Trabajo de alta calidad. Definitivamente volveré a contar con él.',
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  console.log('✓ Reseñas creadas');

  // ==========================================
  // MENSAJES
  // ==========================================
  console.log('💬 Creando mensajes...');

  await Promise.all([
    prisma.message.create({
      data: {
        id: randomUUID(),
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Hola Juan, ¿podrías ayudarme a reparar una mesa la próxima semana?',
        read: true,
        readAt: now,
        createdAt: now,
      },
    }),
    prisma.message.create({
      data: {
        id: randomUUID(),
        senderId: user2.id,
        receiverId: user1.id,
        content: '¡Claro María! ¿Qué día te viene mejor?',
        read: false,
        createdAt: now,
      },
    }),
    prisma.message.create({
      data: {
        id: randomUUID(),
        senderId: user3.id,
        receiverId: user4.id,
        content: 'Hola Carlos, ¿podrías ayudarme a instalar un programa en mi ordenador?',
        read: true,
        readAt: now,
        createdAt: now,
      },
    }),
    prisma.message.create({
      data: {
        id: randomUUID(),
        senderId: user4.id,
        receiverId: user3.id,
        content: 'Por supuesto Ana. ¿Cuándo te vendría bien?',
        read: false,
        createdAt: now,
      },
    }),
  ]);

  console.log('✓ Mensajes creados');

  // ==========================================
  // TRANSACCIONES DE CRÉDITOS
  // ==========================================
  console.log('💰 Creando transacciones de créditos...');

  await Promise.all([
    prisma.creditTransaction.create({
      data: {
        id: randomUUID(),
        userId: user1.id,
        amount: 10,
        balance: 260,
        reason: 'COMMUNITY_HELP',
        description: 'Clase de jardinería para Juan',
        relatedId: user2.id,
        createdAt: now,
      },
    }),
    prisma.creditTransaction.create({
      data: {
        id: randomUUID(),
        userId: user2.id,
        amount: -10,
        balance: 170,
        reason: 'PURCHASE',
        description: 'Clase de jardinería con María',
        relatedId: user1.id,
        createdAt: now,
      },
    }),
    prisma.creditTransaction.create({
      data: {
        id: randomUUID(),
        userId: user1.id,
        amount: 5,
        balance: 255,
        reason: 'EVENT_ATTENDANCE',
        description: 'Asistencia al taller de compostaje',
        createdAt: now,
      },
    }),
  ]);

  console.log('✓ Transacciones creadas');

  // ==========================================
  // NOTIFICACIONES
  // ==========================================
  console.log('🔔 Creando notificaciones...');

  await Promise.all([
    prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: user1.id,
        type: 'NEW_MESSAGE',
        title: 'Nuevo mensaje',
        body: 'Juan te ha enviado un mensaje',
        read: false,
        data: { senderId: user2.id },
        createdAt: now,
      },
    }),
    prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: user2.id,
        type: 'POST_SUPPORT',
        title: 'Apoyo recibido',
        body: 'María te ha dejado una reseña',
        read: true,
        readAt: now,
        data: { reviewerId: user1.id, rating: 5 },
        createdAt: now,
      },
    }),
    prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: user3.id,
        type: 'EVENT_REMINDER',
        title: 'Recordatorio de evento',
        body: 'El taller de compostaje comienza mañana',
        read: false,
        data: { eventId: event1.id },
        createdAt: now,
      },
    }),
  ]);

  console.log('✓ Notificaciones creadas');

  console.log('\n✅ Seed completo exitoso!');
  console.log('\n📊 Resumen de datos creados:');
  console.log('  - 5 usuarios (4 ciudadanos + 1 admin)');
  console.log('  - 1 comunidad (Pamplona Centro)');
  console.log('  - 4 conexiones entre usuarios');
  console.log('  - 4 habilidades');
  console.log('  - 5 ofertas (4 servicios + 1 producto)');
  console.log('  - 1 compra grupal activa con 3 participantes');
  console.log('  - 3 eventos comunitarios');
  console.log('  - 4 publicaciones con comentarios');
  console.log('  - 2 desafíos semanales');
  console.log('  - 4 reseñas');
  console.log('  - 4 mensajes');
  console.log('  - 3 transacciones de créditos');
  console.log('  - 3 notificaciones');
  console.log('\n🔑 Credenciales de prueba:');
  console.log('  Email: maria@comunidad.local');
  console.log('  Email: juan@comunidad.local');
  console.log('  Email: ana@comunidad.local');
  console.log('  Email: carlos@comunidad.local');
  console.log('  Email: admin@comunidad.local');
  console.log('  Password (para todos): Test1234!');
  console.log('\n💡 La base de datos ahora tiene datos de prueba para:');
  console.log('  ✓ Sistema de usuarios y perfiles');
  console.log('  ✓ Comunidades y membresías');
  console.log('  ✓ Red social (conexiones, posts, comentarios)');
  console.log('  ✓ Marketplace (ofertas, búsquedas)');
  console.log('  ✓ Compras grupales');
  console.log('  ✓ Eventos y asistencia');
  console.log('  ✓ Banco de tiempo (habilidades)');
  console.log('  ✓ Sistema de reputación (reseñas)');
  console.log('  ✓ Mensajería');
  console.log('  ✓ Gamificación (desafíos, logros)');
  console.log('  ✓ Sistema de créditos');
  console.log('  ✓ Notificaciones');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
