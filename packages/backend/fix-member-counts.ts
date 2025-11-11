import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMemberCounts() {
  try {
    const communities = await prisma.community.findMany();

    console.log('🔍 Verificando contadores de miembros:\n');

    for (const comm of communities) {
      // Contar usuarios reales con esta communityId
      const realCount = await prisma.user.count({
        where: { communityId: comm.id }
      });

      const storedCount = comm.membersCount;

      console.log(`📊 ${comm.name}:`);
      console.log(`   Contador almacenado: ${storedCount}`);
      console.log(`   Miembros reales: ${realCount}`);

      if (realCount !== storedCount) {
        console.log(`   ⚠️  Discrepancia detectada! Corrigiendo...`);
        await prisma.community.update({
          where: { id: comm.id },
          data: { membersCount: realCount }
        });
        console.log(`   ✅ Corregido a ${realCount}`);
      } else {
        console.log(`   ✅ Correcto`);
      }
      console.log();
    }

    console.log('✅ Todos los contadores corregidos');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMemberCounts();
