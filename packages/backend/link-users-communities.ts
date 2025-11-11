import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkUsersToCommunities() {
  try {
    console.log('🏘️  Vinculando usuarios a comunidades...');

    // Obtener usuarios y comunidades existentes
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const communities = await prisma.community.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (users.length === 0) {
      console.error('❌ No hay usuarios en la base de datos.');
      return;
    }

    if (communities.length === 0) {
      console.error('❌ No hay comunidades en la base de datos.');
      return;
    }

    console.log(`   Vinculando ${users.length} usuarios a ${communities.length} comunidades`);

    // Vincular usuarios a comunidades de forma distribuida
    const updates = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Asignar comunidad de forma circular
      const communityIndex = i % communities.length;
      const community = communities[communityIndex];

      updates.push(
        prisma.user.update({
          where: { id: user.id },
          data: {
            communityId: community.id,
          },
        })
      );
    }

    await Promise.all(updates);

    console.log('✅ Usuarios vinculados exitosamente a comunidades');

    // Mostrar resumen
    const usersWithCommunity = await prisma.user.findMany({
      include: {
        community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const communityCounts = new Map<string, number>();
    for (const user of usersWithCommunity) {
      if (user.community) {
        const count = communityCounts.get(user.community.name) || 0;
        communityCounts.set(user.community.name, count + 1);
      }
    }

    console.log('\n📊 Resumen de usuarios por comunidad:');
    for (const [communityName, count] of communityCounts.entries()) {
      console.log(`   • ${communityName}: ${count} usuarios`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkUsersToCommunities();
