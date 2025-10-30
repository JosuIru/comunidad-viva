import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    // Buscar si existe el admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@local' }
    });

    if (existingAdmin) {
      // Actualizar el admin existente
      await prisma.user.update({
        where: { email: 'admin@local' },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true,
        }
      });
      console.log('✅ Admin actualizado: admin@local / Admin123!');
    } else {
      // Crear nuevo admin
      await prisma.user.create({
        data: {
          email: 'admin@local',
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN',
          isEmailVerified: true,
        }
      });
      console.log('✅ Admin creado: admin@local / Admin123!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
