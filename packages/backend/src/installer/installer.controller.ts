import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InstallerService } from './installer.service';

@Controller('installer')
export class InstallerController {
  constructor(private readonly installerService: InstallerService) {}

  @Get()
  async showWelcome(@Res() res: Response) {
    const status = await this.installerService.getInstallationStatus();
    return res.status(HttpStatus.OK).json(status);
  }

  @Get('check-requirements')
  async checkRequirements(@Res() res: Response) {
    const requirements = await this.installerService.checkRequirements();
    return res.status(HttpStatus.OK).json(requirements);
  }

  @Post('database')
  async configureDatabase(@Body() config: any, @Res() res: Response) {
    try {
      const result = await this.installerService.testDatabaseConnection(config);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Post('create-admin')
  async createAdmin(@Body() admin: any, @Res() res: Response) {
    try {
      const result = await this.installerService.createAdminUser(admin);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Post('migrate')
  async runMigrations(@Res() res: Response) {
    try {
      const result = await this.installerService.runMigrations();
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Post('seed')
  async seedDatabase(@Body() options: any, @Res() res: Response) {
    try {
      const result = await this.installerService.seedDatabase(options);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Post('blockchain')
  async configureBlockchain(@Body() config: any, @Res() res: Response) {
    try {
      const result = await this.installerService.configureBlockchain(config);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Post('complete')
  async completeInstallation(@Res() res: Response) {
    try {
      const result = await this.installerService.markAsInstalled();
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get('status')
  async getStatus(@Res() res: Response) {
    const status = await this.installerService.getInstallationStatus();
    return res.status(HttpStatus.OK).json(status);
  }
}
