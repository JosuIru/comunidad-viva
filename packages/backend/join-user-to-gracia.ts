import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function joinCommunity() {
  try {
    // Buscar el usuario con solicitud pendiente
    const pendingRequest = await prisma.membershipRequest.findFirst({
      where: { status: 'PENDING' }
    });

    if (!pendingRequest) {
      console.log('❌ No se encontró solicitud pendiente');
      await prisma.$disconnect();
      return;
    }

    const userId = pendingRequest.userId;

    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, communityId: true }
    });

    console.log('👤 Usuario encontrado:', user?.name, '(' + user?.email + ')');
    console.log('   Comunidad actual:', user?.communityId || 'Ninguna');

    // Obtener comunidad Barrio de Gracia
    const graciaComm = await prisma.community.findFirst({
      where: { slug: 'gracia-barcelona' }
    });

    if (!graciaComm) {
      console.log('❌ No se encontró la comunidad Barrio de Gracia');
      await prisma.$disconnect();
      return;
    }

    console.log('\n🏘️  Uniéndote a:', graciaComm.name);

    // Unir usuario a la comunidad
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { communityId: graciaComm.id }
      }),
      prisma.community.update({
        where: { id: graciaComm.id },
        data: { membersCount: { increment: 1 } }
      })
    ]);

    console.log('✅ Te has unido exitosamente a', graciaComm.name);

    // Opcional: eliminar la solicitud pendiente
    await prisma.membershipRequest.delete({
      where: { id: pendingRequest.id }
    });

    console.log('✅ Solicitud pendiente eliminada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

joinCommunity();
