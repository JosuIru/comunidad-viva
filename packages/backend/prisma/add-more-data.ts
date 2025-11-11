import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Añadiendo más datos de prueba...');

  const hashedPassword = await bcrypt.hash('Test1234!', 10);

  // Obtener usuarios existentes
  const existingUsers = await prisma.user.findMany();
  console.log(`✓ Encontrados ${existingUsers.length} usuarios existentes`);

  // Obtener comunidades existentes
  const existingCommunities = await prisma.community.findMany();
  console.log(`✓ Encontradas ${existingCommunities.length} comunidades existentes`);

  // ==========================================
  // AÑADIR MÁS USUARIOS (10 usuarios nuevos)
  // ==========================================
  console.log('\n👥 Añadiendo más usuarios...');

  const newUsers = await Promise.all([
    // Usuario 10: Diseñadora gráfica
    prisma.user.create({
      data: {
        email: 'laura@comunidad.local',
        password: hashedPassword,
        name: 'Laura Fernández',
        bio: 'Diseñadora gráfica freelance. Ofrezco diseño de logos y branding.',
        role: 'CITIZEN',
        lat: 42.8120,
        lng: -1.6440,
        address: 'Calle Estafeta 20, Pamplona',
        neighborhood: 'Centro',
        credits: 200,
        level: 4,
        experience: 900,
        peopleHelped: 45,
        hoursShared: 90,
        hoursReceived: 20,
        totalSaved: 350,
        co2Avoided: 50,
        voteCredits: 35,
        interests: ['diseño', 'arte', 'branding', 'creatividad'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 11: Desarrollador web
    prisma.user.create({
      data: {
        email: 'pablo@comunidad.local',
        password: hashedPassword,
        name: 'Pablo Sánchez',
        bio: 'Desarrollador web. Ayudo con páginas web y apps.',
        role: 'CITIZEN',
        lat: 42.8150,
        lng: -1.6500,
        address: 'Av. Baja Navarra 5, Pamplona',
        neighborhood: 'Iturrama',
        credits: 280,
        level: 5,
        experience: 1400,
        peopleHelped: 90,
        hoursShared: 180,
        hoursReceived: 35,
        totalSaved: 600,
        co2Avoided: 80,
        voteCredits: 45,
        interests: ['programación', 'tecnología', 'web', 'apps'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 12: Chef
    prisma.user.create({
      data: {
        email: 'sofia@comunidad.local',
        password: hashedPassword,
        name: 'Sofía Ruiz',
        bio: 'Chef profesional. Doy clases de cocina y catering para eventos.',
        role: 'CITIZEN',
        lat: 42.8100,
        lng: -1.6350,
        address: 'Plaza del Castillo 10, Pamplona',
        neighborhood: 'Centro',
        credits: 320,
        level: 6,
        experience: 1800,
        peopleHelped: 150,
        hoursShared: 300,
        hoursReceived: 45,
        totalSaved: 950,
        co2Avoided: 120,
        voteCredits: 55,
        interests: ['cocina', 'gastronomía', 'eventos', 'catering'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 13: Fotógrafa
    prisma.user.create({
      data: {
        email: 'carmen@comunidad.local',
        password: hashedPassword,
        name: 'Carmen Vega',
        bio: 'Fotógrafa profesional. Fotografía de eventos y retratos.',
        role: 'CITIZEN',
        lat: 42.8080,
        lng: -1.6420,
        address: 'Calle San Nicolás 15, Pamplona',
        neighborhood: 'Casco Viejo',
        credits: 190,
        level: 3,
        experience: 750,
        peopleHelped: 40,
        hoursShared: 80,
        hoursReceived: 18,
        totalSaved: 280,
        co2Avoided: 40,
        voteCredits: 30,
        interests: ['fotografía', 'arte', 'eventos', 'retratos'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 14: Mecánico de bicicletas
    prisma.user.create({
      data: {
        email: 'david@comunidad.local',
        password: hashedPassword,
        name: 'David Moreno',
        bio: 'Mecánico de bicicletas. Reparaciones y talleres de mantenimiento.',
        role: 'CITIZEN',
        lat: 42.8140,
        lng: -1.6480,
        address: 'Calle Yanguas y Miranda 25, Pamplona',
        neighborhood: 'San Juan',
        credits: 160,
        level: 3,
        experience: 650,
        peopleHelped: 55,
        hoursShared: 110,
        hoursReceived: 22,
        totalSaved: 380,
        co2Avoided: 95,
        voteCredits: 28,
        interests: ['bicicletas', 'movilidad', 'mecánica', 'sostenibilidad'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 15: Profesora de yoga
    prisma.user.create({
      data: {
        email: 'elena@comunidad.local',
        password: hashedPassword,
        name: 'Elena Torres',
        bio: 'Profesora de yoga y meditación. Clases grupales e individuales.',
        role: 'CITIZEN',
        lat: 42.8090,
        lng: -1.6390,
        address: 'Paseo Sarasate 12, Pamplona',
        neighborhood: 'Centro',
        credits: 210,
        level: 4,
        experience: 1000,
        peopleHelped: 85,
        hoursShared: 170,
        hoursReceived: 30,
        totalSaved: 450,
        co2Avoided: 55,
        voteCredits: 40,
        interests: ['yoga', 'meditación', 'bienestar', 'salud'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 16: Jardinero
    prisma.user.create({
      data: {
        email: 'raul@comunidad.local',
        password: hashedPassword,
        name: 'Raúl Jiménez',
        bio: 'Jardinero y paisajista. Mantenimiento de jardines y huertos urbanos.',
        role: 'CITIZEN',
        lat: 42.8110,
        lng: -1.6460,
        address: 'Calle Amaya 8, Pamplona',
        neighborhood: 'Centro',
        credits: 140,
        level: 2,
        experience: 480,
        peopleHelped: 35,
        hoursShared: 70,
        hoursReceived: 15,
        totalSaved: 220,
        co2Avoided: 65,
        voteCredits: 22,
        interests: ['jardinería', 'huertos', 'plantas', 'sostenibilidad'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 17: Músico
    prisma.user.create({
      data: {
        email: 'adrian@comunidad.local',
        password: hashedPassword,
        name: 'Adrián Castro',
        bio: 'Músico y profesor de guitarra. Clases y actuaciones.',
        role: 'CITIZEN',
        lat: 42.8130,
        lng: -1.6410,
        address: 'Calle Jarauta 18, Pamplona',
        neighborhood: 'Casco Viejo',
        credits: 175,
        level: 3,
        experience: 720,
        peopleHelped: 48,
        hoursShared: 96,
        hoursReceived: 20,
        totalSaved: 310,
        co2Avoided: 35,
        voteCredits: 32,
        interests: ['música', 'guitarra', 'enseñanza', 'arte'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 18: Electricista
    prisma.user.create({
      data: {
        email: 'sergio@comunidad.local',
        password: hashedPassword,
        name: 'Sergio Romero',
        bio: 'Electricista profesional. Instalaciones y reparaciones eléctricas.',
        role: 'CITIZEN',
        lat: 42.8070,
        lng: -1.6370,
        address: 'Calle Mayor 45, Pamplona',
        neighborhood: 'Casco Viejo',
        credits: 230,
        level: 4,
        experience: 1100,
        peopleHelped: 75,
        hoursShared: 150,
        hoursReceived: 28,
        totalSaved: 520,
        co2Avoided: 60,
        voteCredits: 38,
        interests: ['electricidad', 'reparaciones', 'instalaciones', 'ahorro-energético'],
        weeklyMood: 'AVAILABLE',
      },
    }),

    // Usuario 19: Costurera
    prisma.user.create({
      data: {
        email: 'isabel@comunidad.local',
        password: hashedPassword,
        name: 'Isabel Vargas',
        bio: 'Costurera y modista. Arreglos de ropa y creación de prendas.',
        role: 'CITIZEN',
        lat: 42.8160,
        lng: -1.6450,
        address: 'Calle Navarrería 30, Pamplona',
        neighborhood: 'Casco Viejo',
        credits: 150,
        level: 3,
        experience: 600,
        peopleHelped: 52,
        hoursShared: 104,
        hoursReceived: 18,
        totalSaved: 290,
        co2Avoided: 75,
        voteCredits: 26,
        interests: ['costura', 'moda', 'reciclaje-textil', 'reparación'],
        weeklyMood: 'AVAILABLE',
      },
    }),
  ]);

  console.log(`✓ Añadidos ${newUsers.length} usuarios nuevos`);

  // Combinar usuarios existentes y nuevos
  const allUsers = [...existingUsers, ...newUsers];

  // ==========================================
  // AÑADIR MÁS OFERTAS (30 ofertas nuevas)
  // ==========================================
  console.log('\n🛍️  Añadiendo más ofertas...');

  const newOffers = await Promise.all([
    // Ofertas de Laura (Diseñadora)
    prisma.offer.create({
      data: {
        userId: newUsers[0].id,
        communityId: existingCommunities[0]?.id,
        title: 'Diseño de logo profesional',
        description: 'Creo logos únicos y profesionales para tu negocio o proyecto personal.',
        type: 'SERVICE',
        category: 'Diseño',
        priceCredits: 150,
        priceEur: 80,
        lat: 42.8120,
        lng: -1.6440,
        address: 'Pamplona Centro',
        tags: ['diseño', 'logo', 'branding', 'identidad'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[0].id,
        title: 'Diseño de tarjetas de visita',
        description: 'Diseño profesional de tarjetas de visita digitales e imprimibles.',
        type: 'SERVICE',
        category: 'Diseño',
        priceCredits: 50,
        priceEur: 25,
        lat: 42.8120,
        lng: -1.6440,
        tags: ['diseño', 'tarjetas', 'branding'],
      },
    }),

    // Ofertas de Pablo (Desarrollador)
    prisma.offer.create({
      data: {
        userId: newUsers[1].id,
        communityId: existingCommunities[1]?.id,
        title: 'Creación de página web',
        description: 'Desarrollo de páginas web modernas y responsivas. Incluye diseño y hosting por 1 año.',
        type: 'SERVICE',
        category: 'Tecnología',
        priceCredits: 400,
        priceEur: 200,
        lat: 42.8150,
        lng: -1.6500,
        address: 'Pamplona Iturrama',
        tags: ['web', 'desarrollo', 'programación', 'diseño-web'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[1].id,
        title: 'Reparación de ordenadores',
        description: 'Soluciono problemas de hardware y software. Instalación de sistemas operativos.',
        type: 'SERVICE',
        category: 'Tecnología',
        priceCredits: 80,
        priceEur: 40,
        lat: 42.8150,
        lng: -1.6500,
        tags: ['reparación', 'ordenadores', 'tecnología'],
      },
    }),

    // Ofertas de Sofía (Chef)
    prisma.offer.create({
      data: {
        userId: newUsers[2].id,
        title: 'Clases de cocina vegana',
        description: 'Aprende a cocinar deliciosos platos veganos. Clases grupales o individuales.',
        type: 'SERVICE',
        category: 'Educación',
        priceCredits: 60,
        priceEur: 30,
        lat: 42.8100,
        lng: -1.6350,
        address: 'Plaza del Castillo, Pamplona',
        tags: ['cocina', 'vegano', 'clases', 'gastronomía'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[2].id,
        communityId: existingCommunities[0]?.id,
        title: 'Catering para eventos',
        description: 'Servicio de catering profesional para eventos comunitarios. Menú personalizado.',
        type: 'SERVICE',
        category: 'Servicios',
        priceCredits: 300,
        priceEur: 150,
        lat: 42.8100,
        lng: -1.6350,
        tags: ['catering', 'eventos', 'cocina', 'comunidad'],
      },
    }),

    // Ofertas de Carmen (Fotógrafa)
    prisma.offer.create({
      data: {
        userId: newUsers[3].id,
        title: 'Sesión fotográfica familiar',
        description: 'Sesión de fotos familiar en exteriores. Incluye 20 fotos editadas.',
        type: 'SERVICE',
        category: 'Servicios',
        priceCredits: 120,
        priceEur: 60,
        lat: 42.8080,
        lng: -1.6420,
        address: 'Casco Viejo, Pamplona',
        tags: ['fotografía', 'familia', 'retratos'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[3].id,
        title: 'Fotografía de eventos comunitarios',
        description: 'Cobertura fotográfica completa de tu evento. Álbum digital incluido.',
        type: 'SERVICE',
        category: 'Servicios',
        priceCredits: 200,
        priceEur: 100,
        lat: 42.8080,
        lng: -1.6420,
        tags: ['fotografía', 'eventos', 'comunidad'],
      },
    }),

    // Ofertas de David (Mecánico de bicicletas)
    prisma.offer.create({
      data: {
        userId: newUsers[4].id,
        communityId: existingCommunities[2]?.id,
        title: 'Revisión completa de bicicleta',
        description: 'Revisión y puesta a punto de tu bicicleta. Incluye ajuste de frenos, cambios y engrase.',
        type: 'SERVICE',
        category: 'Reparaciones',
        priceCredits: 40,
        priceEur: 20,
        lat: 42.8140,
        lng: -1.6480,
        address: 'San Juan, Pamplona',
        tags: ['bicicleta', 'reparación', 'movilidad', 'sostenibilidad'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[4].id,
        title: 'Taller de mantenimiento de bicicletas',
        description: 'Aprende a mantener tu bicicleta. Taller práctico de 2 horas.',
        type: 'SERVICE',
        category: 'Educación',
        priceCredits: 30,
        priceEur: 15,
        lat: 42.8140,
        lng: -1.6480,
        tags: ['bicicleta', 'taller', 'aprendizaje', 'DIY'],
      },
    }),

    // Ofertas de Elena (Yoga)
    prisma.offer.create({
      data: {
        userId: newUsers[5].id,
        title: 'Clase de yoga en grupo',
        description: 'Clases de yoga para todos los niveles. Todos los martes y jueves a las 19:00.',
        type: 'SERVICE',
        category: 'Salud y Bienestar',
        priceCredits: 25,
        priceEur: 12,
        lat: 42.8090,
        lng: -1.6390,
        address: 'Paseo Sarasate, Pamplona',
        tags: ['yoga', 'bienestar', 'salud', 'meditación'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[5].id,
        communityId: existingCommunities[0]?.id,
        title: 'Sesión de meditación guiada',
        description: 'Meditación guiada para reducir el estrés y encontrar paz interior.',
        type: 'SERVICE',
        category: 'Salud y Bienestar',
        priceCredits: 20,
        priceEur: 10,
        lat: 42.8090,
        lng: -1.6390,
        tags: ['meditación', 'mindfulness', 'bienestar'],
      },
    }),

    // Ofertas de Raúl (Jardinero)
    prisma.offer.create({
      data: {
        userId: newUsers[6].id,
        title: 'Mantenimiento de jardín',
        description: 'Poda, corte de césped y cuidado general de jardines. Servicio mensual.',
        type: 'SERVICE',
        category: 'Jardinería',
        priceCredits: 70,
        priceEur: 35,
        lat: 42.8110,
        lng: -1.6460,
        address: 'Centro, Pamplona',
        tags: ['jardinería', 'plantas', 'mantenimiento'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[6].id,
        title: 'Asesoría para huerto urbano',
        description: 'Te ayudo a crear y mantener tu huerto urbano. Incluye plan de cultivo.',
        type: 'SERVICE',
        category: 'Jardinería',
        priceCredits: 45,
        priceEur: 22,
        lat: 42.8110,
        lng: -1.6460,
        tags: ['huerto', 'urbano', 'sostenibilidad', 'alimentación'],
      },
    }),

    // Ofertas de Adrián (Músico)
    prisma.offer.create({
      data: {
        userId: newUsers[7].id,
        title: 'Clases de guitarra',
        description: 'Clases de guitarra para principiantes y nivel medio. Todos los estilos.',
        type: 'SERVICE',
        category: 'Educación',
        priceCredits: 35,
        priceEur: 18,
        lat: 42.8130,
        lng: -1.6410,
        address: 'Casco Viejo, Pamplona',
        tags: ['música', 'guitarra', 'clases', 'arte'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[7].id,
        communityId: existingCommunities[1]?.id,
        title: 'Actuación musical para eventos',
        description: 'Música en directo para tus eventos. Repertorio variado: pop, rock, folk.',
        type: 'SERVICE',
        category: 'Servicios',
        priceCredits: 150,
        priceEur: 75,
        lat: 42.8130,
        lng: -1.6410,
        tags: ['música', 'eventos', 'concierto', 'directo'],
      },
    }),

    // Ofertas de Sergio (Electricista)
    prisma.offer.create({
      data: {
        userId: newUsers[8].id,
        title: 'Instalación de puntos de luz',
        description: 'Instalación profesional de lámparas, enchufes y puntos de luz.',
        type: 'SERVICE',
        category: 'Reparaciones',
        priceCredits: 80,
        priceEur: 40,
        lat: 42.8070,
        lng: -1.6370,
        address: 'Casco Viejo, Pamplona',
        tags: ['electricidad', 'instalación', 'iluminación'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[8].id,
        title: 'Revisión eléctrica del hogar',
        description: 'Revisión completa de la instalación eléctrica. Informe incluido.',
        type: 'SERVICE',
        category: 'Reparaciones',
        priceCredits: 100,
        priceEur: 50,
        lat: 42.8070,
        lng: -1.6370,
        tags: ['electricidad', 'revisión', 'seguridad', 'hogar'],
      },
    }),

    // Ofertas de Isabel (Costurera)
    prisma.offer.create({
      data: {
        userId: newUsers[9].id,
        title: 'Arreglos de ropa',
        description: 'Arreglo todo tipo de prendas: bajos, costuras, cremalleras, etc.',
        type: 'SERVICE',
        category: 'Ropa',
        priceCredits: 20,
        priceEur: 10,
        lat: 42.8160,
        lng: -1.6450,
        address: 'Casco Viejo, Pamplona',
        tags: ['costura', 'ropa', 'arreglos', 'reparación'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[9].id,
        communityId: existingCommunities[0]?.id,
        title: 'Confección de ropa a medida',
        description: 'Creo prendas únicas y personalizadas. Diseños exclusivos.',
        type: 'SERVICE',
        category: 'Ropa',
        priceCredits: 120,
        priceEur: 60,
        lat: 42.8160,
        lng: -1.6450,
        tags: ['costura', 'moda', 'personalizado', 'artesanal'],
      },
    }),

    // Ofertas de productos
    prisma.offer.create({
      data: {
        userId: allUsers[5].id,
        title: 'Verduras ecológicas de temporada',
        description: 'Cesta de verduras frescas y ecológicas. Directas del huerto.',
        type: 'PRODUCT',
        category: 'Alimentación',
        priceCredits: 25,
        priceEur: 12,
        stock: 15,
        lat: 42.55,
        lng: -1.75,
        tags: ['verduras', 'ecológico', 'local', 'temporada'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: allUsers[6].id,
        title: 'Queso artesano de Andia',
        description: 'Queso de oveja curado artesanalmente. 1kg.',
        type: 'PRODUCT',
        category: 'Alimentación',
        priceCredits: 45,
        priceEur: 22,
        stock: 8,
        lat: 42.85,
        lng: -2.05,
        address: 'Lezaun, Navarra',
        tags: ['queso', 'artesano', 'oveja', 'local'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[8].id,
        title: 'Miel de montaña',
        description: 'Miel 100% natural de las montañas de Améscoa. Bote de 500g.',
        type: 'PRODUCT',
        category: 'Alimentación',
        priceCredits: 30,
        priceEur: 15,
        stock: 12,
        lat: 42.76,
        lng: -2.24,
        tags: ['miel', 'natural', 'montaña', 'local'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: allUsers[7].id,
        title: 'Herramientas artesanales de hierro',
        description: 'Herramientas de jardín forjadas a mano. Durabilidad garantizada.',
        type: 'PRODUCT',
        category: 'Hogar',
        priceCredits: 65,
        priceEur: 32,
        stock: 5,
        lat: 42.75,
        lng: -2.25,
        address: 'Zudaire, Navarra',
        tags: ['herramientas', 'artesanal', 'hierro', 'jardín'],
      },
    }),

    // Ofertas de banco de tiempo
    prisma.offer.create({
      data: {
        userId: newUsers[1].id,
        title: 'Ayuda con tecnología para mayores',
        description: 'Enseño a usar smartphones, tablets y ordenadores. Paciencia garantizada.',
        type: 'TIME_BANK',
        category: 'Tecnología',
        priceCredits: 1,
        lat: 42.8150,
        lng: -1.6500,
        tags: ['tecnología', 'enseñanza', 'mayores', 'paciencia'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[4].id,
        title: 'Acompañamiento para ir en bici',
        description: 'Te acompaño en tus primeros trayectos en bici por la ciudad.',
        type: 'TIME_BANK',
        category: 'Transporte',
        priceCredits: 1,
        lat: 42.8140,
        lng: -1.6480,
        tags: ['bicicleta', 'acompañamiento', 'aprendizaje', 'movilidad'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[0].id,
        title: 'Clases de diseño básico',
        description: 'Aprende los fundamentos del diseño gráfico. Para principiantes.',
        type: 'TIME_BANK',
        category: 'Educación',
        priceCredits: 1,
        lat: 42.8120,
        lng: -1.6440,
        tags: ['diseño', 'educación', 'gráfico', 'aprendizaje'],
      },
    }),

    prisma.offer.create({
      data: {
        userId: newUsers[6].id,
        title: 'Ayuda con plantas de interior',
        description: 'Te ayudo a cuidar tus plantas de interior. Diagnóstico y consejos.',
        type: 'TIME_BANK',
        category: 'Jardinería',
        priceCredits: 1,
        lat: 42.8110,
        lng: -1.6460,
        tags: ['plantas', 'interior', 'cuidados', 'jardínería'],
      },
    }),
  ]);

  console.log(`✓ Añadidas ${newOffers.length} ofertas nuevas`);

  // ==========================================
  // AÑADIR MÁS EVENTOS (15 eventos nuevos)
  // ==========================================
  console.log('\n📅 Añadiendo más eventos...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(19, 0, 0, 0);

  const newEvents = await Promise.all([
    prisma.event.create({
      data: {
        organizerId: newUsers[0].id,
        communityId: existingCommunities[0]?.id,
        title: 'Taller de Diseño de Marca Personal',
        description: 'Aprende a crear tu marca personal profesional. Incluye creación de logo básico.',
        type: 'WORKSHOP',
        address: 'Centro Cívico Iturrama, Pamplona',
        lat: 42.8120,
        lng: -1.6440,
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 15,
        creditsReward: 10,
        tags: ['diseño', 'marca-personal', 'taller', 'branding'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[1].id,
        communityId: existingCommunities[1]?.id,
        title: 'Introducción a la Programación Web',
        description: 'Taller práctico de HTML, CSS y JavaScript para principiantes.',
        type: 'WORKSHOP',
        address: 'Online y presencial en Pamplona',
        lat: 42.8150,
        lng: -1.6500,
        startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 20,
        creditsReward: 15,
        tags: ['programación', 'web', 'taller', 'tecnología'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[2].id,
        title: 'Showcooking: Cocina de Temporada',
        description: 'Demostración de cocina con productos de temporada. Degustación incluida.',
        type: 'SKILLSHARE',
        address: 'Plaza del Castillo, Pamplona',
        lat: 42.8100,
        lng: -1.6350,
        startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 25,
        creditsReward: 8,
        tags: ['cocina', 'showcooking', 'temporada', 'gastronomía'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[3].id,
        communityId: existingCommunities[0]?.id,
        title: 'Paseo Fotográfico por el Casco Viejo',
        description: 'Recorrido fotográfico por el casco histórico. Aprende técnicas de fotografía urbana.',
        type: 'SOCIAL',
        address: 'Plaza del Ayuntamiento, Pamplona',
        lat: 42.8180,
        lng: -1.6450,
        startsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 12,
        creditsReward: 5,
        tags: ['fotografía', 'paseo', 'casco-viejo', 'urbano'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[4].id,
        title: 'Biciescuela: Aprende a Circular Seguro',
        description: 'Taller de circulación segura en bicicleta por la ciudad.',
        type: 'WORKSHOP',
        address: 'Parque de la Ciudadela, Pamplona',
        lat: 42.8230,
        lng: -1.6430,
        startsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 15,
        creditsReward: 6,
        tags: ['bicicleta', 'movilidad', 'seguridad', 'taller'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[5].id,
        communityId: existingCommunities[2]?.id,
        title: 'Yoga al Amanecer en el Parque',
        description: 'Sesión de yoga matinal al aire libre. Todos los niveles bienvenidos.',
        type: 'SOCIAL',
        address: 'Parque Yamaguchi, Pamplona',
        lat: 42.8040,
        lng: -1.6330,
        startsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
        capacity: 30,
        creditsReward: 4,
        tags: ['yoga', 'aire-libre', 'bienestar', 'mañana'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[6].id,
        title: 'Taller de Huerto Urbano',
        description: 'Aprende a crear y mantener tu huerto en casa. Incluye semillas para empezar.',
        type: 'WORKSHOP',
        address: 'Huertos Urbanos de Arrotxapea, Pamplona',
        lat: 42.8250,
        lng: -1.6580,
        startsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 18,
        creditsReward: 10,
        tags: ['huerto', 'urbano', 'sostenibilidad', 'taller'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[7].id,
        communityId: existingCommunities[1]?.id,
        title: 'Concierto Acústico Comunitario',
        description: 'Tarde de música acústica en el parque. Trae tu instrumento si quieres participar.',
        type: 'SOCIAL',
        address: 'Parque de la Taconera, Pamplona',
        lat: 42.8190,
        lng: -1.6510,
        startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 50,
        creditsReward: 12,
        tags: ['música', 'acústico', 'comunidad', 'aire-libre'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[8].id,
        title: 'Charla: Eficiencia Energética en el Hogar',
        description: 'Aprende a reducir tu consumo eléctrico y ahorrar en la factura.',
        type: 'SKILLSHARE',
        address: 'Centro Cívico San Jorge, Pamplona',
        lat: 42.8170,
        lng: -1.6390,
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 40,
        creditsReward: 8,
        tags: ['energía', 'eficiencia', 'ahorro', 'sostenibilidad'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[9].id,
        title: 'Taller de Reparación Textil',
        description: 'Aprende técnicas básicas de costura para reparar tu ropa.',
        type: 'REPAIR_CAFE',
        address: 'Casa de la Juventud, Pamplona',
        lat: 42.8120,
        lng: -1.6470,
        startsAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 15,
        creditsReward: 7,
        tags: ['costura', 'reparación', 'textil', 'sostenibilidad'],
        requirements: [],
      },
    }),

    // Eventos de usuarios existentes
    prisma.event.create({
      data: {
        organizerId: allUsers[0].id,
        communityId: existingCommunities[0]?.id,
        title: 'Mercadillo de Intercambio',
        description: 'Trae objetos que no uses y intercámbialos por otros. ¡Segunda vida para tus cosas!',
        type: 'MARKET',
        address: 'Plaza Consistorial, Pamplona',
        lat: 42.8178,
        lng: -1.6453,
        startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        capacity: 100,
        creditsReward: 15,
        tags: ['intercambio', 'mercadillo', 'reutilización', 'comunidad'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: allUsers[4].id,
        title: 'Limpieza Comunitaria del Barrio',
        description: 'Jornada de limpieza y embellecimiento de espacios públicos.',
        type: 'CLEANUP',
        address: 'Punto de encuentro: Plaza del Castillo',
        lat: 42.8169,
        lng: -1.6444,
        startsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 50,
        creditsReward: 20,
        tags: ['limpieza', 'comunidad', 'medio-ambiente', 'acción'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: allUsers[1].id,
        communityId: existingCommunities[1]?.id,
        title: 'Taller de Compostaje Casero',
        description: 'Aprende a compostar tus residuos orgánicos en casa. Incluye compostador.',
        type: 'WORKSHOP',
        address: 'Jardín Comunitario de Rochapea, Pamplona',
        lat: 42.8260,
        lng: -1.6350,
        startsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 20,
        creditsReward: 10,
        tags: ['compostaje', 'residuos', 'sostenibilidad', 'medio-ambiente'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: allUsers[2].id,
        title: 'Cine Fórum: Documentales sobre Sostenibilidad',
        description: 'Proyección y debate de documentales sobre economía circular y sostenibilidad.',
        type: 'SOCIAL',
        address: 'Escuela de Idiomas, Pamplona',
        lat: 42.8145,
        lng: -1.6425,
        startsAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 60,
        creditsReward: 5,
        tags: ['cine', 'documental', 'sostenibilidad', 'debate'],
        requirements: [],
      },
    }),

    prisma.event.create({
      data: {
        organizerId: newUsers[2].id,
        communityId: existingCommunities[0]?.id,
        title: 'Cena Comunitaria: Platos del Mundo',
        description: 'Cada participante trae un plato típico de su cultura. Compartimos y celebramos.',
        type: 'COMMUNITY_MEAL',
        address: 'Centro Cívico Ensanche, Pamplona',
        lat: 42.8125,
        lng: -1.6495,
        startsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 40,
        creditsReward: 12,
        tags: ['cena', 'comunidad', 'intercultural', 'gastronomía'],
        requirements: [],
      },
    }),
  ]);

  console.log(`✓ Añadidos ${newEvents.length} eventos nuevos`);

  // ==========================================
  // RESUMEN FINAL
  // ==========================================
  console.log('\n✅ ¡Datos adicionales añadidos exitosamente!\n');
  console.log('📊 Resumen de datos añadidos:');
  console.log(`   • ${newUsers.length} usuarios nuevos`);
  console.log(`   • ${newOffers.length} ofertas nuevas`);
  console.log(`   • ${newEvents.length} eventos nuevos\n`);

  console.log('👥 Nuevos usuarios (todos con contraseña: Test1234!):');
  newUsers.forEach(user => {
    console.log(`   • ${user.email.padEnd(30)} - ${user.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error al añadir datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
