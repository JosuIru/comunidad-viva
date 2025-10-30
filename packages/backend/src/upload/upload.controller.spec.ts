import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  const mockUploadService = {
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    getStorageInfo: jest.fn(),
    deleteFile: jest.fn(),
    isS3Enabled: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        S3_BUCKET: undefined,
        S3_ACCESS_KEY: undefined,
        S3_SECRET_KEY: undefined,
        S3_REGION: 'us-east-1',
        API_URL: 'http://localhost:4000',
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have uploadService injected', () => {
    expect(uploadService).toBeDefined();
  });

  describe('getStorageInfo', () => {
    it('should return storage info', () => {
      const mockStorageInfo = {
        type: 'local',
        bucket: null,
        region: null,
      };
      mockUploadService.getStorageInfo.mockReturnValue(mockStorageInfo);

      const result = controller.getStorageInfo();

      expect(result).toEqual(mockStorageInfo);
      expect(mockUploadService.getStorageInfo).toHaveBeenCalled();
    });
  });
});
