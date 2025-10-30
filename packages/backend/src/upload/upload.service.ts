import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { extname } from 'path';
import { randomBytes } from 'crypto';

export interface UploadedFileInfo {
  url: string;
  key: string;
  filename: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private readonly useS3: boolean;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Check if S3 is configured
    const s3Bucket = this.configService.get<string>('S3_BUCKET');
    const s3AccessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const s3SecretKey = this.configService.get<string>('S3_SECRET_KEY');
    const s3Region = this.configService.get<string>('S3_REGION', 'us-east-1');

    this.useS3 = !!(s3Bucket && s3AccessKey && s3SecretKey);
    this.bucketName = s3Bucket || '';
    this.region = s3Region;
    this.baseUrl = this.configService.get<string>('API_URL', 'http://localhost:4000');

    if (this.useS3) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: s3AccessKey!,
          secretAccessKey: s3SecretKey!,
        },
      });
      this.logger.log(`S3 storage enabled: bucket=${this.bucketName}, region=${this.region}`);
    } else {
      this.logger.warn('S3 not configured - using local disk storage');
    }
  }

  /**
   * Generate a unique filename
   */
  private generateUniqueFilename(originalName: string): string {
    const ext = extname(originalName);
    const randomString = randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${randomString}${ext}`;
  }

  /**
   * Upload file to S3 or local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadedFileInfo> {
    const filename = this.generateUniqueFilename(file.originalname);
    const key = `${folder}/${filename}`;

    if (this.useS3 && this.s3Client) {
      return this.uploadToS3(file, key);
    } else {
      return this.uploadToLocal(file, filename);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<UploadedFileInfo[]> {
    return Promise.all(files.map(file => this.uploadFile(file, folder)));
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    key: string,
  ): Promise<UploadedFileInfo> {
    try {
      const upload = new Upload({
        client: this.s3Client!,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read', // Make files publicly accessible
        },
      });

      await upload.done();

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        url,
        key,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error('Failed to upload to S3', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Upload file to local storage (fallback)
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    filename: string,
  ): Promise<UploadedFileInfo> {
    // Note: With memory storage, files are in buffer
    // This method returns metadata, actual file saving happens in controller with diskStorage
    const url = `${this.baseUrl}/uploads/${filename}`;

    this.logger.log(`File uploaded to local storage: ${filename}`);

    return {
      url,
      key: filename,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Delete file from S3 or local storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.useS3 && this.s3Client) {
      await this.deleteFromS3(key);
    } else {
      await this.deleteFromLocal(key);
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);

      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete from S3', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Delete file from local storage
   */
  private async deleteFromLocal(key: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const filePath = path.join(process.cwd(), 'uploads', key);
      await fs.unlink(filePath);
      this.logger.log(`File deleted from local storage: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete from local storage', error);
      // Don't throw error if file doesn't exist
    }
  }

  /**
   * Check if S3 is enabled
   */
  isS3Enabled(): boolean {
    return this.useS3;
  }

  /**
   * Get storage info
   */
  getStorageInfo() {
    return {
      type: this.useS3 ? 's3' : 'local',
      bucket: this.useS3 ? this.bucketName : null,
      region: this.useS3 ? this.region : null,
    };
  }
}
