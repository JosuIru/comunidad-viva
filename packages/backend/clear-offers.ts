import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearOffers() {
  try {
    console.log('🗑️  Borrando ofertas antiguas y registros relacionados...');

    // Borrar en orden para respetar las foreign keys
    const interests = await prisma.offerInterest.deleteMany({});
    console.log(`   - ${interests.count} intereses en ofertas eliminados`);

    const timeBankOffers = await prisma.timeBankOffer.deleteMany({});
    console.log(`   - ${timeBankOffers.count} ofertas de banco de tiempo eliminadas`);

    const groupBuys = await prisma.groupBuy.deleteMany({});
    console.log(`   - ${groupBuys.count} compras grupales eliminadas`);

    // Los eventos tienen su propio offerId opcional, pero no los borramos todos
    const events = await prisma.event.updateMany({
      where: { offerId: { not: null } },
      data: { offerId: null }
    });
    console.log(`   - ${events.count} eventos desvinculados de ofertas`);

    const offers = await prisma.offer.deleteMany({});
    console.log(`✅ ${offers.count} ofertas eliminadas`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearOffers();
