import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, Get, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { FileValidationService } from '../common/file-validation.service';
import { memoryStorage } from 'multer';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private fileValidationService: FileValidationService,
  ) {}
  @ApiOperation({ summary: 'Upload single image' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Validate file size
    this.fileValidationService.validateFileSize(file.size, 5 * 1024 * 1024); // 5MB

    // Validate file extension
    this.fileValidationService.validateFileExtension(file.originalname, file.mimetype);

    // Validate file content using magic numbers (prevents MIME type spoofing)
    this.fileValidationService.validateImage(file.buffer, file.mimetype);

    return await this.uploadService.uploadFile(file, 'images');
  }

  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    // Validate each file
    for (const file of files) {
      // Validate file size
      this.fileValidationService.validateFileSize(file.size, 5 * 1024 * 1024); // 5MB

      // Validate file extension
      this.fileValidationService.validateFileExtension(file.originalname, file.mimetype);

      // Validate file content using magic numbers (prevents MIME type spoofing)
      this.fileValidationService.validateImage(file.buffer, file.mimetype);
    }

    const uploadedFiles = await this.uploadService.uploadFiles(files, 'images');
    return { files: uploadedFiles };
  }

  @ApiOperation({ summary: 'Get storage info' })
  @ApiResponse({ status: 200, description: 'Storage configuration info' })
  @Get('storage-info')
  getStorageInfo() {
    return this.uploadService.getStorageInfo();
  }
}
