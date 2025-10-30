import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [PrismaModule, WebSocketModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService], // Exportar para usar en otros módulos
})
export class AchievementsModule {}
