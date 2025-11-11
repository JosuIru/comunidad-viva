import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createOffers() {
  try {
    console.log('🛍️  Creando nuevas ofertas...');

    // Obtener usuarios y comunidades existentes
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const communities = await prisma.community.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (users.length === 0) {
      console.error('❌ No hay usuarios en la base de datos. Ejecuta el seed completo primero.');
      return;
    }

    if (communities.length === 0) {
      console.error('❌ No hay comunidades en la base de datos. Ejecuta el seed completo primero.');
      return;
    }

    console.log(`   Usando ${users.length} usuarios y ${communities.length} comunidades existentes`);

    const offers = await Promise.all([
      // ========== PRODUCTOS ==========

      // 1. Producto - Alimentación
      prisma.offer.create({
        data: {
          userId: users[Math.min(6, users.length - 1)].id,
          communityId: communities[Math.min(3, communities.length - 1)].id,
          type: 'PRODUCT',
          category: 'Alimentación',
          title: 'Verduras ecológicas y cereales antiguos',
          description: 'Verduras de temporada cultivadas sin químicos. Trigo sarraceno, espelta y otras variedades tradicionales de Navarra. Recogida en la finca o entrega en Pamplona.',
          images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999'],
          priceEur: 4.50,
          priceCredits: 45,
          stock: 30,
          lat: users[Math.min(6, users.length - 1)].lat,
          lng: users[Math.min(6, users.length - 1)].lng,
          address: users[Math.min(6, users.length - 1)].address,
          tags: ['verduras', 'ecológico', 'cereales', 'km0', 'navarra'],
          status: 'ACTIVE',
          featured: true,
          views: 35,
          interested: 14,
        },
      }),

      // 2. Producto - Alimentación (Queso)
      prisma.offer.create({
        data: {
          userId: users[Math.min(5, users.length - 1)].id,
          communityId: communities[Math.min(3, communities.length - 1)].id,
          type: 'PRODUCT',
          category: 'Alimentación',
          title: 'Gazta ekologikoa / Queso artesano de oveja',
          description: 'Queso artesano elaborado con leche de ovejas de la Sierra de Andía. 100% natural y ecológico. Curación de 6 meses.',
          images: ['https://images.unsplash.com/photo-1452195100486-9cc805987862'],
          priceEur: 12,
          priceCredits: 120,
          stock: 15,
          lat: users[Math.min(5, users.length - 1)].lat,
          lng: users[Math.min(5, users.length - 1)].lng,
          address: users[Math.min(5, users.length - 1)].address,
          tags: ['queso', 'artesano', 'ecológico', 'local', 'navarra'],
          status: 'ACTIVE',
          featured: true,
          views: 28,
          interested: 9,
        },
      }),

      // 3. Producto - Alimentación (Miel)
      prisma.offer.create({
        data: {
          userId: users[Math.min(8, users.length - 1)].id,
          communityId: communities[Math.min(2, communities.length - 1)].id,
          type: 'PRODUCT',
          category: 'Alimentación',
          title: 'Eztia / Miel de montaña de Améscoa',
          description: 'Miel de flores de montaña del valle de Améscoa. Producción artesanal y ecológica. Tarro de 500g.',
          images: ['https://images.unsplash.com/photo-1587049352846-4a222e784443'],
          priceEur: 8.50,
          priceCredits: 85,
          stock: 25,
          lat: users[Math.min(8, users.length - 1)].lat,
          lng: users[Math.min(8, users.length - 1)].lng,
          address: users[Math.min(8, users.length - 1)].address,
          tags: ['miel', 'ecológico', 'artesano', 'montaña', 'navarra'],
          status: 'ACTIVE',
          featured: true,
          views: 32,
          interested: 11,
        },
      }),

      // 4. Producto - Hogar
      prisma.offer.create({
        data: {
          userId: users[0].id,
          communityId: communities[0].id,
          type: 'PRODUCT',
          category: 'Hogar',
          title: 'Muebles restaurados de segunda mano',
          description: 'Mesa de madera maciza restaurada, ideal para comedor o cocina. Medidas: 140x80cm. Estado impecable.',
          images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'],
          priceEur: 80,
          priceCredits: 800,
          stock: 1,
          lat: users[0].lat,
          lng: users[0].lng,
          address: users[0].address,
          tags: ['muebles', 'reciclaje', 'segunda-mano', 'sostenible'],
          status: 'ACTIVE',
          views: 22,
          interested: 5,
        },
      }),

      // 5. Producto - Electrónica
      prisma.offer.create({
        data: {
          userId: users[Math.min(2, users.length - 1)].id,
          communityId: communities[Math.min(1, communities.length - 1)].id,
          type: 'PRODUCT',
          category: 'Tecnología',
          title: 'Portátil Lenovo ThinkPad renovado',
          description: 'Portátil Lenovo ThinkPad T480 renovado. i5-8250U, 8GB RAM, SSD 256GB. Perfecto estado, batería nueva.',
          images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853'],
          priceEur: 320,
          priceCredits: 3200,
          stock: 1,
          lat: users[Math.min(2, users.length - 1)].lat,
          lng: users[Math.min(2, users.length - 1)].lng,
          address: users[Math.min(2, users.length - 1)].address,
          tags: ['electrónica', 'portátil', 'renovado', 'segunda-mano'],
          status: 'ACTIVE',
          views: 48,
          interested: 12,
        },
      }),

      // 6. Producto - Ropa
      prisma.offer.create({
        data: {
          userId: users[Math.min(3, users.length - 1)].id,
          communityId: communities[0].id,
          type: 'PRODUCT',
          category: 'Ropa',
          title: 'Ropa sostenible y de comercio justo',
          description: 'Camisetas de algodón orgánico certificado. Varias tallas y colores disponibles. Producción ética.',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
          priceEur: 18,
          priceCredits: 180,
          stock: 50,
          lat: users[Math.min(3, users.length - 1)].lat,
          lng: users[Math.min(3, users.length - 1)].lng,
          address: users[Math.min(3, users.length - 1)].address,
          tags: ['ropa', 'ecológico', 'comercio-justo', 'sostenible'],
          status: 'ACTIVE',
          featured: true,
          views: 41,
          interested: 15,
        },
      }),

      // ========== SERVICIOS ==========

      // 7. Servicio - Hogar
      prisma.offer.create({
        data: {
          userId: users[Math.min(1, users.length - 1)].id,
          communityId: communities[Math.min(1, communities.length - 1)].id,
          type: 'SERVICE',
          category: 'Servicios',
          title: 'Reparación y restauración de muebles',
          description: 'Arreglo todo tipo de muebles de madera. Restauración, barnizado, tapizado. 20 años de experiencia.',
          images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'],
          priceEur: 25,
          priceCredits: 250,
          lat: users[Math.min(1, users.length - 1)].lat,
          lng: users[Math.min(1, users.length - 1)].lng,
          address: users[Math.min(1, users.length - 1)].address,
          tags: ['reparación', 'carpintería', 'reciclaje', 'muebles'],
          status: 'ACTIVE',
          views: 30,
          interested: 8,
        },
      }),

      // 8. Servicio - Educación
      prisma.offer.create({
        data: {
          userId: users[Math.min(2, users.length - 1)].id,
          communityId: communities[0].id,
          type: 'SERVICE',
          category: 'Servicios',
          title: 'Clases de inglés y francés',
          description: 'Profesora titulada ofrece clases particulares de inglés y francés para todos los niveles. Presencial u online.',
          images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b'],
          priceEur: 15,
          priceCredits: 150,
          lat: users[Math.min(2, users.length - 1)].lat,
          lng: users[Math.min(2, users.length - 1)].lng,
          address: users[Math.min(2, users.length - 1)].address,
          tags: ['educación', 'idiomas', 'inglés', 'francés'],
          status: 'ACTIVE',
          featured: true,
          views: 62,
          interested: 18,
        },
      }),

      // 9. Servicio - Transporte
      prisma.offer.create({
        data: {
          userId: users[Math.min(4, users.length - 1)].id,
          communityId: communities[Math.min(3, communities.length - 1)].id,
          type: 'SERVICE',
          category: 'Servicios',
          title: 'Coche compartido Pamplona-Zaragoza',
          description: 'Viajo regularmente entre Pamplona y Zaragoza. 3 plazas disponibles. Comparte gastos de gasolina.',
          images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
          priceEur: 8,
          priceCredits: 80,
          lat: users[Math.min(4, users.length - 1)].lat,
          lng: users[Math.min(4, users.length - 1)].lng,
          address: users[Math.min(4, users.length - 1)].address,
          tags: ['transporte', 'coche-compartido', 'sostenible', 'blablacar'],
          status: 'ACTIVE',
          views: 27,
          interested: 6,
        },
      }),

      // 10. Servicio - Otros (Herrería)
      prisma.offer.create({
        data: {
          userId: users[Math.min(7, users.length - 1)].id,
          communityId: communities[Math.min(2, communities.length - 1)].id,
          type: 'SERVICE',
          category: 'Otros',
          title: 'Burdin-lanak / Trabajos de herrería artesanal',
          description: 'Herramientas, decoración y reparaciones en hierro forjado. Trabajos a medida.',
          images: ['https://images.unsplash.com/photo-1530105186532-c4e119c1b5f5'],
          priceEur: 35,
          priceCredits: 350,
          lat: users[Math.min(7, users.length - 1)].lat,
          lng: users[Math.min(7, users.length - 1)].lng,
          address: users[Math.min(7, users.length - 1)].address,
          tags: ['herrería', 'artesanía', 'hierro', 'forja', 'navarra'],
          status: 'ACTIVE',
          views: 18,
          interested: 6,
        },
      }),

      // 11. Servicio - Jardinería
      prisma.offer.create({
        data: {
          userId: users[0].id,
          communityId: communities[0].id,
          type: 'SERVICE',
          category: 'Servicios',
          title: 'Cuidado de huertos urbanos y jardines',
          description: 'Ofrezco servicios de jardinería, cuidado de huertos urbanos, poda, plantación. Asesoramiento en agricultura ecológica.',
          images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b'],
          priceEur: 20,
          priceCredits: 200,
          lat: users[0].lat,
          lng: users[0].lng,
          address: users[0].address,
          tags: ['jardinería', 'huertos', 'ecológico', 'plantas'],
          status: 'ACTIVE',
          featured: true,
          views: 39,
          interested: 10,
        },
      }),
    ]);

    console.log(`✅ ${offers.length} nuevas ofertas creadas exitosamente`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOffers();
