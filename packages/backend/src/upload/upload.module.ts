import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileValidationService } from '../common/file-validation.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, FileValidationService],
  exports: [UploadService, FileValidationService],
})
export class UploadModule {}
