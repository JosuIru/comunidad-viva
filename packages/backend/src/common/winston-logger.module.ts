import { Module, Global } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

@Global()
@Module({
  providers: [
    {
      provide: WinstonLoggerService,
      useFactory: () => {
        return new WinstonLoggerService('Application');
      },
    },
  ],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
