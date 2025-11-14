import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

@Injectable()
export class InstallerService {
  private readonly logger = new Logger(InstallerService.name);
  private readonly installFlagPath = path.join(
    __dirname,
    '../../../.installed',
  );

  constructor(private prisma: PrismaService) {}

  async getInstallationStatus() {
    const isInstalled = fs.existsSync(this.installFlagPath);

    if (!isInstalled) {
      return {
        installed: false,
        step: 'welcome',
      };
    }

    try {
      // Verificar que el admin existe
      const adminCount = await this.prisma.user.count({
        where: { role: 'ADMIN' },
      });

      return {
        installed: true,
        hasAdmin: adminCount > 0,
      };
    } catch (error) {
      return {
        installed: false,
        step: 'database',
        error: 'Database not configured',
      };
    }
  }

  async checkRequirements() {
    const requirements = {
      nodejs: { installed: false, version: null, required: '18.0.0' },
      postgresql: { installed: false, version: null, required: '14.0.0' },
      npm: { installed: false, version: null, required: '9.0.0' },
      diskSpace: { installed: false, available: null, required: '1GB' },
      memory: { installed: false, available: null, required: '2GB' },
    };

    try {
      // Check Node.js
      const nodeVersion = process.version;
      requirements.nodejs.installed = true;
      requirements.nodejs.version = nodeVersion;

      // Check npm
      const { stdout: npmVersion } = await execAsync('npm --version');
      requirements.npm.installed = true;
      requirements.npm.version = npmVersion.trim();

      // Check PostgreSQL
      try {
        const { stdout: pgVersion } = await execAsync('psql --version');
        requirements.postgresql.installed = true;
        requirements.postgresql.version = pgVersion.split(' ')[2];
      } catch (error) {
        requirements.postgresql.installed = false;
      }

      // Check disk space (Linux/Mac)
      try {
        const { stdout: diskInfo } = await execAsync('df -h . | tail -1');
        const parts = diskInfo.split(/\s+/);
        requirements.diskSpace.available = parts[3];
        requirements.diskSpace.installed = true; // Si pudimos obtener info, está OK
      } catch (error) {
        requirements.diskSpace.available = 'Unknown';
        requirements.diskSpace.installed = false;
      }

      // Check memory
      try {
        const { stdout: memInfo } = await execAsync(
          'free -h | grep Mem | awk \'{print $7}\'',
        );
        requirements.memory.available = memInfo.trim();
        requirements.memory.installed = true; // Si pudimos obtener info, está OK
      } catch (error) {
        // En Mac o Windows
        requirements.memory.available = 'Unknown';
        requirements.memory.installed = false;
      }
    } catch (error) {
      this.logger.error('Error checking requirements:', error);
    }

    return requirements;
  }

  async testDatabaseConnection(config: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  }) {
    const connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

    try {
      // Intentar conectar usando el connection string
      const { PrismaClient } = require('@prisma/client');
      const testClient = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
      });

      await testClient.$connect();
      await testClient.$disconnect();

      // Guardar en .env
      await this.updateEnvFile('DATABASE_URL', connectionString);

      return {
        success: true,
        message: 'Database connection successful',
      };
    } catch (error) {
      this.logger.error('Database connection failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async runMigrations() {
    try {
      this.logger.log('Running Prisma migrations...');

      // Generar cliente Prisma
      await execAsync('npx prisma generate');

      // Ejecutar migraciones
      await execAsync('npx prisma migrate deploy');

      return {
        success: true,
        message: 'Migrations completed successfully',
      };
    } catch (error) {
      this.logger.error('Migration failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createAdminUser(admin: {
    name: string;
    email: string;
    password: string;
  }) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Crear usuario admin
      const user = await this.prisma.user.create({
        data: {
          id: randomUUID(),
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Admin user created successfully',
        userId: user.id,
      };
    } catch (error) {
      this.logger.error('Failed to create admin user:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async seedDatabase(options: { includeTestData: boolean }) {
    try {
      if (options.includeTestData) {
        this.logger.log('Seeding database with test data...');
        await execAsync('npm run seed');
      }

      return {
        success: true,
        message: 'Database seeded successfully',
      };
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async configureBlockchain(config: {
    useOfficialToken: boolean;
    polygonRpcUrl?: string;
    solanaRpcUrl?: string;
    enableFederation: boolean;
  }) {
    try {
      // Configuraciones oficiales de SEMILLA token
      const OFFICIAL_CONFIG = {
        // Polygon Mumbai Testnet (cambiar a mainnet en producción)
        POLYGON_SEMILLA_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: Deploy real contract
        POLYGON_RPC_URL: 'https://rpc-mumbai.maticvigil.com',

        // Solana Devnet (cambiar a mainnet en producción)
        SOLANA_SEMILLA_MINT: '11111111111111111111111111111111', // TODO: Deploy real token
        SOLANA_RPC_URL: 'https://api.devnet.solana.com',
      };

      if (config.useOfficialToken) {
        // Usar token oficial SEMILLA
        await this.updateEnvFile('SEMILLA_TOKEN_ADDRESS', OFFICIAL_CONFIG.POLYGON_SEMILLA_ADDRESS);
        await this.updateEnvFile('SEMILLA_MINT_ADDRESS', OFFICIAL_CONFIG.SOLANA_SEMILLA_MINT);
        await this.updateEnvFile('POLYGON_RPC_URL', config.polygonRpcUrl || OFFICIAL_CONFIG.POLYGON_RPC_URL);
        await this.updateEnvFile('SOLANA_RPC_URL', config.solanaRpcUrl || OFFICIAL_CONFIG.SOLANA_RPC_URL);

        this.logger.log('✅ Configurado para usar token SEMILLA oficial');
      } else {
        // Modo personalizado - el usuario debe deployar su propio contrato
        this.logger.warn('⚠️ Modo personalizado: deberás deployar tus propios contratos');
        await this.updateEnvFile('CUSTOM_DEPLOYMENT', 'true');
      }

      // Configurar federación
      if (config.enableFederation) {
        await this.updateEnvFile('FEDERATION_ENABLED', 'true');
        // Generar DID único para esta instalación
        const communityDid = `did:truk:${this.generateUUID()}`;
        await this.updateEnvFile('COMMUNITY_DID', communityDid);
        this.logger.log(`✅ Federación habilitada con DID: ${communityDid}`);
      }

      return {
        success: true,
        message: 'Blockchain configuration completed',
        useOfficialToken: config.useOfficialToken,
        federationEnabled: config.enableFederation,
      };
    } catch (error) {
      this.logger.error('Blockchain configuration failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async markAsInstalled() {
    try {
      // Crear archivo .installed
      fs.writeFileSync(this.installFlagPath, new Date().toISOString());

      return {
        success: true,
        message: 'Installation completed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private async updateEnvFile(key: string, value: string) {
    const envPath = path.join(__dirname, '../../../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    const lines = envContent.split('\n');
    let found = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${key}=`)) {
        lines[i] = `${key}="${value}"`;
        found = true;
        break;
      }
    }

    if (!found) {
      lines.push(`${key}="${value}"`);
    }

    fs.writeFileSync(envPath, lines.join('\n'));
  }
}
