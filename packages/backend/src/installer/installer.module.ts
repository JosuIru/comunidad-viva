import { Module } from '@nestjs/common';
import { InstallerController } from './installer.controller';
import { InstallerService } from './installer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstallerController],
  providers: [InstallerService],
})
export class InstallerModule {}
