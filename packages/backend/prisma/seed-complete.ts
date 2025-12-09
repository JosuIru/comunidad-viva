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

  // Más ofertas de servicios
  const offer6 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      type: 'SERVICE',
      category: 'Salud',
      title: 'Clases de yoga al aire libre',
      description: 'Sesiones de yoga en el parque para todos los niveles. Ambiente relajado y conexión con la naturaleza.',
      priceCredits: 6,
      lat: 42.9820,
      lng: -1.7150,
      address: 'Parque de la Taconera, Pamplona',
      communityId: community.id,
      tags: ['yoga', 'salud', 'bienestar', 'deporte'],
      status: 'ACTIVE',
      views: 52,
      interested: 11,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer7 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      type: 'SERVICE',
      category: 'Transporte',
      title: 'Servicio de bicicleta compartida',
      description: 'Presto mi bicicleta eléctrica para desplazamientos por la ciudad. Ideal para recados.',
      priceCredits: 3,
      lat: 42.9870,
      lng: -1.7280,
      address: 'Avenida Baja Navarra, Pamplona',
      communityId: community.id,
      tags: ['transporte', 'bicicleta', 'movilidad sostenible'],
      status: 'ACTIVE',
      views: 34,
      interested: 8,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer8 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user4.id,
      type: 'PRODUCT',
      category: 'Hogar',
      title: 'Muebles reciclados restaurados',
      description: 'Vendo muebles vintage restaurados con materiales sostenibles. Cada pieza es única.',
      priceCredits: 45,
      priceEur: 75,
      stock: 5,
      lat: 42.9600,
      lng: -1.7400,
      address: 'Calle Bergamín 28, Pamplona',
      communityId: community.id,
      tags: ['muebles', 'reciclaje', 'decoración', 'sostenible'],
      status: 'ACTIVE',
      views: 68,
      interested: 15,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer9 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user3.id,
      type: 'SERVICE',
      category: 'Alimentación',
      title: 'Repostería casera sin gluten',
      description: 'Preparo tartas, galletas y postres sin gluten, lactosa ni azúcar refinado.',
      priceCredits: 12,
      lat: 42.9750,
      lng: -1.7100,
      address: 'Calle Monasterio de Urdax 5, Pamplona',
      communityId: community.id,
      tags: ['repostería', 'sin gluten', 'alimentación saludable'],
      status: 'ACTIVE',
      views: 41,
      interested: 9,
      createdAt: now,
      updatedAt: now,
    },
  });

  const offer10 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      type: 'SERVICE',
      category: 'Educación',
      title: 'Taller de compostaje comunitario',
      description: 'Enseño a crear compost casero y gestionar residuos orgánicos de forma sostenible.',
      priceCredits: 8,
      lat: 42.9910,
      lng: -1.7190,
      address: 'Centro Cívico Iturrama, Pamplona',
      communityId: community.id,
      tags: ['compostaje', 'sostenibilidad', 'medio ambiente'],
      status: 'ACTIVE',
      views: 57,
      interested: 13,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✓ Ofertas creadas (10 ofertas)');

  // ==========================================
  // OFERTAS DE BANCO DE TIEMPO
  // ==========================================
  console.log('⏰ Creando ofertas de banco de tiempo...');

  await Promise.all([
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: offer1.id,
        skillId: skill1.id,
        estimatedHours: 2,
        canTeach: true,
        maxStudents: 6,
        experienceLevel: 'INTERMEDIATE',
        toolsNeeded: ['herramientas de jardinería'],
      },
    }),
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: offer2.id,
        skillId: skill2.id,
        estimatedHours: 3,
        canTeach: true,
        maxStudents: 4,
        experienceLevel: 'EXPERT',
        toolsNeeded: ['herramientas de carpintería'],
      },
    }),
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: offer3.id,
        skillId: skill3.id,
        estimatedHours: 1.5,
        canTeach: true,
        maxStudents: 8,
        experienceLevel: 'BEGINNER',
        toolsNeeded: [],
      },
    }),
  ]);

  console.log('✓ Ofertas de banco de tiempo creadas');

  // ==========================================
  // MÁS COMUNIDADES
  // ==========================================
  console.log('🏘️  Creando más comunidades...');

  const community2 = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'pamplona-rochapea',
      name: 'Rochapea Solidaria',
      description: 'Comunidad del barrio de Rochapea enfocada en ayuda mutua y economía circular',
      type: 'NEIGHBORHOOD',
      visibility: 'PUBLIC',
      lat: 42.8200,
      lng: -1.6450,
      radiusKm: 3,
      createdAt: now,
      updatedAt: now,
    },
  });

  const community3 = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'navarra-sostenible',
      name: 'Navarra Sostenible',
      description: 'Red regional de cooperación para la transición ecológica y social',
      type: 'REGION',
      visibility: 'PUBLIC',
      lat: 42.6954,
      lng: -1.6761,
      radiusKm: 50,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✓ Más comunidades creadas (3 comunidades totales)');

  // ==========================================
  // VIVIENDA TEMPORAL
  // ==========================================
  console.log('🏠 Creando viviendas temporales...');

  const housing1 = await prisma.temporaryHousing.create({
    data: {
      id: randomUUID(),
      hostId: user1.id,
      communityId: community.id,
      type: 'EXCHANGE',
      title: 'Habitación luminosa en el centro',
      description: 'Habitación privada en piso compartido. Ambiente tranquilo y acogedor. Perfecto para estancias cortas.',
      images: [],
      address: 'Calle San Nicolás 12, Pamplona',
      lat: 42.8182,
      lng: -1.6444,
      accommodationType: 'PRIVATE_ROOM',
      beds: 1,
      bathrooms: 1,
      squareMeters: 15,
      amenities: ['wifi', 'cocina compartida', 'calefacción', 'ropa de cama'],
      houseRules: ['no fumar', 'respetar horarios de descanso'],
      availableFrom: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      availableTo: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      minNights: 3,
      maxNights: 30,
      exchangeType: 'CREDITS',
      creditsPerNight: 8,
      maxGuests: 1,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const housing2 = await prisma.temporaryHousing.create({
    data: {
      id: randomUUID(),
      hostId: user2.id,
      communityId: community.id,
      type: 'GUEST',
      title: 'Sofá-cama para viajeros',
      description: 'Ofrezco mi sofá-cama para viajeros de paso. Ambiente familiar y buen rollo.',
      images: [],
      address: 'Plaza San Francisco 8, Pamplona',
      lat: 42.8167,
      lng: -1.6425,
      accommodationType: 'COUCH',
      beds: 1,
      bathrooms: 1,
      amenities: ['wifi', 'cocina', 'ducha'],
      houseRules: ['no fumar', 'participar en tareas del hogar'],
      availableFrom: now,
      availableTo: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      minNights: 1,
      maxNights: 5,
      exchangeType: 'FREE',
      isFree: true,
      maxGuests: 1,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const housing3 = await prisma.temporaryHousing.create({
    data: {
      id: randomUUID(),
      hostId: user4.id,
      communityId: community.id,
      type: 'NOMAD',
      title: 'Apartamento para nómadas digitales',
      description: 'Apartamento completo con espacio de trabajo. Ideal para trabajadores remotos.',
      images: [],
      address: 'Avenida del Ejército 15, Pamplona',
      lat: 42.8090,
      lng: -1.6380,
      accommodationType: 'ENTIRE_PLACE',
      beds: 1,
      bathrooms: 1,
      squareMeters: 45,
      amenities: ['wifi fibra', 'escritorio', 'cocina equipada', 'lavadora'],
      houseRules: ['no fiestas', 'mantener limpieza'],
      availableFrom: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      availableTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      minNights: 7,
      maxNights: 90,
      exchangeType: 'MIXED',
      pricePerNight: 35,
      creditsPerNight: 25,
      maxGuests: 2,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const housing4 = await prisma.temporaryHousing.create({
    data: {
      id: randomUUID(),
      hostId: user3.id,
      communityId: community2.id,
      type: 'TRANSITION',
      title: 'Vivienda comunitaria de transición',
      description: 'Habitación en vivienda comunitaria para personas en situación de cambio vital. Apoyo mutuo y espacios compartidos.',
      images: [],
      address: 'Calle Aralar 22, Pamplona',
      lat: 42.8220,
      lng: -1.6470,
      accommodationType: 'SHARED_ROOM',
      beds: 1,
      bathrooms: 2,
      squareMeters: 12,
      amenities: ['cocina comunitaria', 'sala común', 'jardín', 'wifi'],
      houseRules: ['participar en asambleas', 'tareas compartidas', 'respeto mutuo'],
      availableFrom: now,
      availableTo: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      minNights: 30,
      maxNights: 180,
      exchangeType: 'TIME_HOURS',
      hoursPerNight: 0.5,
      maxGuests: 1,
      minReputation: 5,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✓ Viviendas temporales creadas (4 viviendas)');

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

  const event4 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user4.id,
      title: 'Mercadillo de intercambio de ropa',
      description: 'Trae ropa que ya no uses y llévate algo nuevo. Economía circular en acción.',
      lat: 42.9780,
      lng: -1.7200,
      address: 'Plaza del Castillo, Pamplona',
      startsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      capacity: 50,
      creditsReward: 5,
      tags: ['intercambio', 'ropa', 'sostenibilidad', 'economía circular'],
      type: 'MARKET',
      requirements: [],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const event5 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user1.id,
      title: 'Paseo en bicicleta por el Casco Viejo',
      description: 'Ruta guiada en bici descubriendo rincones históricos de Pamplona.',
      lat: 42.8180,
      lng: -1.6430,
      address: 'Plaza Consistorial, Pamplona',
      startsAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 25,
      creditsReward: 8,
      tags: ['bicicleta', 'turismo', 'deporte', 'historia'],
      type: 'SOCIAL',
      requirements: ['Traer tu propia bicicleta'],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const event6 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user3.id,
      title: 'Taller de cocina sin desperdicio',
      description: 'Aprende a cocinar aprovechando todo y reduciendo el desperdicio alimentario.',
      lat: 42.9850,
      lng: -1.7180,
      address: 'Centro Social de Iturrama, Pamplona',
      startsAt: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 15,
      creditsReward: 7,
      tags: ['cocina', 'sostenibilidad', 'alimentación', 'cero residuos'],
      type: 'WORKSHOP',
      requirements: [],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const event7 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user2.id,
      title: 'Jornada de limpieza del río Arga',
      description: 'Voluntariado para limpiar las riberas del río. Materiales proporcionados.',
      lat: 42.8100,
      lng: -1.6350,
      address: 'Paseo fluvial del Arga, Pamplona',
      startsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 40,
      creditsReward: 12,
      tags: ['medio ambiente', 'voluntariado', 'limpieza', 'naturaleza'],
      type: 'CLEANUP',
      requirements: ['Ropa cómoda y guantes'],
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const event8 = await prisma.event.create({
    data: {
      id: randomUUID(),
      organizerId: user4.id,
      title: 'Proyección de documental sobre economía colaborativa',
      description: 'Proyección seguida de debate sobre alternativas económicas.',
      lat: 42.9680,
      lng: -1.7500,
      address: 'Biblioteca de Navarra, Pamplona',
      startsAt: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000),
      capacity: 60,
      creditsReward: 4,
      tags: ['cine', 'economía', 'debate', 'cultura'],
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
    prisma.eventAttendee.create({
      data: {
        id: randomUUID(),
        eventId: event4.id,
        userId: user3.id,
        role: 'PARTICIPANT',
        registeredAt: now,
      },
    }),
    prisma.eventAttendee.create({
      data: {
        id: randomUUID(),
        eventId: event5.id,
        userId: user4.id,
        role: 'PARTICIPANT',
        registeredAt: now,
      },
    }),
  ]);

  console.log('✓ Eventos creados (8 eventos)');

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
  // COMUNIDADES ADICIONALES (ALEJADAS)
  // ==========================================
  console.log('🏘️  Creando comunidades adicionales...');

  const community4 = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'barcelona-gracia',
      name: 'Barcelona Gràcia',
      description: 'Comunidad colaborativa del barrio de Gràcia, Barcelona',
      type: 'NEIGHBORHOOD',
      visibility: 'PUBLIC',
      lat: 41.4036,
      lng: 2.1564,
      radiusKm: 3,
      createdAt: now,
      updatedAt: now,
    },
  });

  const community5 = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'madrid-lavapies',
      name: 'Lavapiés Coopera',
      description: 'Red de ayuda mutua del barrio de Lavapiés, Madrid',
      type: 'NEIGHBORHOOD',
      visibility: 'PUBLIC',
      lat: 40.4089,
      lng: -3.7009,
      radiusKm: 2,
      createdAt: now,
      updatedAt: now,
    },
  });

  const community6 = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'valencia-sostenible',
      name: 'Valencia Sostenible',
      description: 'Comunidad regional de Valencia para la economía circular',
      type: 'REGION',
      visibility: 'PUBLIC',
      lat: 39.4699,
      lng: -0.3763,
      radiusKm: 40,
      createdAt: now,
      updatedAt: now,
    },
  });

  const community7 = await prisma.community.create({
    data: {
      id: randomUUID(),
      slug: 'sevilla-triana',
      name: 'Sevilla Triana',
      description: 'Comunidad del barrio de Triana enfocada en cultura y solidaridad',
      type: 'NEIGHBORHOOD',
      visibility: 'PUBLIC',
      lat: 37.3828,
      lng: -6.0023,
      radiusKm: 3,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✓ Comunidades adicionales creadas (7 comunidades totales)');

  // ==========================================
  // NECESIDADES GEOLOCALIZADAS
  // ==========================================
  console.log('🆘 Creando necesidades...');

  const need1 = await prisma.need.create({
    data: {
      id: randomUUID(),
      creatorId: user3.id,
      communityId: community.id,
      scope: 'PERSONAL',
      category: 'URGENT',
      type: 'LIVELIHOOD',
      title: 'Ayuda con mudanza este fin de semana',
      description: 'Necesito ayuda para trasladar muebles de un piso a otro en el centro. Tengo una furgoneta pero necesito brazos fuertes.',
      images: [],
      location: 'Calle Mayor, Pamplona',
      latitude: 42.8175,
      longitude: -1.6437,
      country: 'ES',
      resourceTypes: ['TIME_HOURS'],
      targetHours: 4,
      neededSkills: ['fuerza física', 'disponibilidad fin de semana'],
      urgencyLevel: 3,
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    },
  });

  const need2 = await prisma.need.create({
    data: {
      id: randomUUID(),
      creatorId: user4.id,
      communityId: community.id,
      scope: 'PERSONAL',
      category: 'CHRONIC',
      type: 'LIVELIHOOD',
      title: 'Cuidado de mascota durante vacaciones',
      description: 'Busco alguien que pueda cuidar de mi gato durante 10 días en agosto. Es muy tranquilo y sociable.',
      images: [],
      location: 'Barrio Rochapea, Pamplona',
      latitude: 42.8195,
      longitude: -1.6420,
      country: 'ES',
      resourceTypes: ['TIME_HOURS'],
      targetHours: 20,
      neededSkills: ['amor por los animales', 'responsabilidad'],
      urgencyLevel: 2,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    },
  });

  const need3 = await prisma.need.create({
    data: {
      id: randomUUID(),
      creatorId: user1.id,
      communityId: community4.id,
      scope: 'PERSONAL',
      category: 'URGENT',
      type: 'INFRASTRUCTURE',
      title: 'Reparación de lavadora',
      description: 'Mi lavadora ha dejado de funcionar y no desagua. Busco alguien con conocimientos de reparación de electrodomésticos.',
      images: [],
      location: 'Calle Verdi, Barcelona',
      latitude: 41.4042,
      longitude: 2.1558,
      country: 'ES',
      resourceTypes: ['TIME_HOURS', 'SKILLS'],
      targetHours: 2,
      neededSkills: ['reparación electrodomésticos', 'electricidad'],
      urgencyLevel: 4,
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    },
  });

  const need4 = await prisma.need.create({
    data: {
      id: randomUUID(),
      creatorId: user2.id,
      communityId: community5.id,
      scope: 'COMMUNITY',
      category: 'PROJECT',
      type: 'EDUCATION',
      title: 'Clases de informática para mayores',
      description: 'Buscamos voluntarios para dar clases básicas de informática y smartphone a personas mayores del barrio.',
      images: [],
      location: 'Centro Cultural Lavapiés, Madrid',
      latitude: 40.4085,
      longitude: -3.7015,
      country: 'ES',
      resourceTypes: ['TIME_HOURS', 'SKILLS'],
      targetHours: 40,
      neededSkills: ['informática', 'paciencia', 'comunicación'],
      urgencyLevel: 2,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    },
  });

  const need5 = await prisma.need.create({
    data: {
      id: randomUUID(),
      creatorId: user3.id,
      communityId: community6.id,
      scope: 'COMMUNITY',
      category: 'PROJECT',
      type: 'ENVIRONMENT',
      title: 'Huerto comunitario - voluntarios',
      description: 'Necesitamos voluntarios para mantener el huerto comunitario. Actividades: riego, plantación, cosecha y mantenimiento.',
      images: [],
      location: 'Jardín del Turia, Valencia',
      latitude: 39.4750,
      longitude: -0.3700,
      country: 'ES',
      resourceTypes: ['TIME_HOURS'],
      targetHours: 100,
      neededSkills: ['jardinería', 'compromiso'],
      urgencyLevel: 1,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    },
  });

  const need6 = await prisma.need.create({
    data: {
      id: randomUUID(),
      creatorId: user1.id,
      communityId: community7.id,
      scope: 'PERSONAL',
      category: 'CHRONIC',
      type: 'HOUSING',
      title: 'Pintar habitación infantil',
      description: 'Necesito ayuda para pintar una habitación. Tengo la pintura y herramientas, solo necesito manos extra.',
      images: [],
      location: 'Barrio Triana, Sevilla',
      latitude: 37.3825,
      longitude: -6.0020,
      country: 'ES',
      resourceTypes: ['TIME_HOURS'],
      targetHours: 6,
      neededSkills: ['pintura', 'bricolaje'],
      urgencyLevel: 2,
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✓ Necesidades creadas (6 necesidades)');

  // ==========================================
  // MÁS OFERTAS DE BANCO DE TIEMPO
  // ==========================================
  console.log('⏰ Creando más ofertas de banco de tiempo...');

  // Primero crear las ofertas base
  const timebankOffer1 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      type: 'SERVICE',
      category: 'Educación',
      title: 'Clases de inglés conversacional',
      description: 'Ofrezco clases de inglés nivel intermedio-avanzado. Enfoque en conversación práctica.',
      images: [],
      lat: 42.8180,
      lng: -1.6445,
      address: 'Plaza del Castillo, Pamplona',
      communityId: community.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const timebankOffer2 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user4.id,
      type: 'SERVICE',
      category: 'Cuidados',
      title: 'Paseo de perros',
      description: 'Ofrezco sacar a pasear perros por el parque. Me encantan los animales y tengo experiencia.',
      images: [],
      lat: 41.4040,
      lng: 2.1560,
      address: 'Parque Güell, Barcelona',
      communityId: community4.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const timebankOffer3 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      type: 'SERVICE',
      category: 'Cuidados',
      title: 'Cuidado de niños por la tarde',
      description: 'Ofrezco cuidar niños de 4-10 años por las tardes. Actividades educativas y juegos.',
      images: [],
      lat: 40.4087,
      lng: -3.7010,
      address: 'Barrio Lavapiés, Madrid',
      communityId: community5.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const timebankOffer4 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user3.id,
      type: 'SERVICE',
      category: 'Alimentación',
      title: 'Clases de cocina vegetariana',
      description: 'Enseño a cocinar platos vegetarianos deliciosos y nutritivos. Recetas fáciles y económicas.',
      images: [],
      lat: 39.4700,
      lng: -0.3760,
      address: 'Mercado Central, Valencia',
      communityId: community6.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  const timebankOffer5 = await prisma.offer.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      type: 'SERVICE',
      category: 'Reparación',
      title: 'Reparación de bicicletas',
      description: 'Reparo todo tipo de bicicletas: frenos, cambios, ruedas, cadenas, etc.',
      images: [],
      lat: 37.3827,
      lng: -6.0022,
      address: 'Puente Isabel II, Sevilla',
      communityId: community7.id,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  // Crear habilidades adicionales para banco de tiempo
  const skill5 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      name: 'Inglés',
      description: 'Nivel C1, experiencia dando clases particulares',
      category: 'Idiomas',
      verified: true,
      endorsements: 8,
    },
  });

  const skill6 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user4.id,
      name: 'Cuidado de mascotas',
      description: 'Experiencia con perros de todos los tamaños',
      category: 'Cuidados',
      verified: false,
      endorsements: 3,
    },
  });

  const skill7 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user1.id,
      name: 'Cuidado infantil',
      description: 'Madre con experiencia en actividades educativas',
      category: 'Cuidados',
      verified: false,
      endorsements: 4,
    },
  });

  const skill8 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user3.id,
      name: 'Cocina vegetariana',
      description: 'Chef vegetariana con formación profesional',
      category: 'Cocina',
      verified: true,
      endorsements: 15,
    },
  });

  const skill9 = await prisma.skill.create({
    data: {
      id: randomUUID(),
      userId: user2.id,
      name: 'Mecánica de bicicletas',
      description: 'Mecánico profesional, especializado en bicis urbanas y de montaña',
      category: 'Reparación',
      verified: true,
      endorsements: 12,
    },
  });

  // Crear las ofertas de banco de tiempo
  await Promise.all([
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: timebankOffer1.id,
        skillId: skill5.id,
        estimatedHours: 1,
        experienceLevel: 'EXPERT',
        canTeach: true,
        maxStudents: 4,
        toolsNeeded: [],
      },
    }),
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: timebankOffer2.id,
        skillId: skill6.id,
        estimatedHours: 1,
        experienceLevel: 'INTERMEDIATE',
        canTeach: false,
        toolsNeeded: ['correa', 'bolsas'],
      },
    }),
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: timebankOffer3.id,
        skillId: skill7.id,
        estimatedHours: 3,
        experienceLevel: 'INTERMEDIATE',
        canTeach: false,
        toolsNeeded: [],
      },
    }),
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: timebankOffer4.id,
        skillId: skill8.id,
        estimatedHours: 2,
        experienceLevel: 'EXPERT',
        canTeach: true,
        maxStudents: 6,
        toolsNeeded: ['ingredientes'],
      },
    }),
    prisma.timeBankOffer.create({
      data: {
        id: randomUUID(),
        offerId: timebankOffer5.id,
        skillId: skill9.id,
        estimatedHours: 1.5,
        experienceLevel: 'EXPERT',
        canTeach: true,
        maxStudents: 2,
        toolsNeeded: ['herramientas de bicicleta'],
      },
    }),
  ]);

  console.log('✓ Ofertas adicionales de banco de tiempo creadas (8 ofertas totales)');

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
  console.log('  - 7 comunidades distribuidas por España:');
  console.log('    • Pamplona Centro, Rochapea, Navarra Regional');
  console.log('    • Barcelona Gràcia, Madrid Lavapiés');
  console.log('    • Valencia Sostenible, Sevilla Triana');
  console.log('  - 4 conexiones entre usuarios');
  console.log('  - 9 habilidades verificadas');
  console.log('  - 15 ofertas geolocalizadas (12 servicios + 3 productos)');
  console.log('  - 8 ofertas de banco de tiempo');
  console.log('  - 6 necesidades geolocalizadas (ayuda mutua)');
  console.log('  - 4 viviendas temporales (incluyendo Vivienda Comunitaria)');
  console.log('  - 1 compra grupal activa con 3 participantes');
  console.log('  - 8 eventos comunitarios geolocalizados');
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
  console.log('  ✓ Comunidades y membresías (7 comunidades en España)');
  console.log('  ✓ Red social (conexiones, posts, comentarios)');
  console.log('  ✓ Marketplace (15 ofertas geolocalizadas)');
  console.log('  ✓ Compras grupales');
  console.log('  ✓ Eventos y asistencia (8 eventos geolocalizados)');
  console.log('  ✓ Banco de tiempo (9 habilidades y 8 ofertas)');
  console.log('  ✓ Necesidades / Ayuda Mutua (6 necesidades)');
  console.log('  ✓ Vivienda temporal (4 viviendas incluyendo comunitaria)');
  console.log('  ✓ Sistema de reputación (reseñas)');
  console.log('  ✓ Mensajería');
  console.log('  ✓ Gamificación (desafíos, logros)');
  console.log('  ✓ Sistema de créditos');
  console.log('  ✓ Notificaciones');
  console.log('\n🗺️  Todos los datos tienen coordenadas geográficas en:');
  console.log('  📍 Pamplona (Navarra)');
  console.log('  📍 Barcelona (Cataluña)');
  console.log('  📍 Madrid (Comunidad de Madrid)');
  console.log('  📍 Valencia (Comunidad Valenciana)');
  console.log('  📍 Sevilla (Andalucía)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
