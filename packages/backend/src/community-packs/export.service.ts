import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Export metrics to CSV format
   */
  async exportMetricsToCSV(communityId: string): Promise<string> {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: {
        metrics: true,
        community: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!pack) {
      throw new Error('Pack not found');
    }

    // CSV Header
    let csv = 'Métrica,Valor Actual,Valor Objetivo,Unidad,Período,Última Actualización\n';

    // Add rows
    for (const metric of pack.metrics) {
      const row = [
        this.escapeCsvField(metric.metricName),
        metric.currentValue.toString(),
        metric.targetValue?.toString() || '',
        this.escapeCsvField(metric.unit || ''),
        metric.period,
        new Date(metric.updatedAt).toLocaleString('es-ES'),
      ];
      csv += row.join(',') + '\n';
    }

    // Add historical data section
    csv += '\n\nHistórico\n';
    csv += 'Métrica,Fecha,Valor\n';

    for (const metric of pack.metrics) {
      const history = Array.isArray(metric.history) ? metric.history : [];
      for (const point of history) {
        const row = [
          this.escapeCsvField(metric.metricName),
          new Date(point.date).toLocaleString('es-ES'),
          point.value.toString(),
        ];
        csv += row.join(',') + '\n';
      }
    }

    return csv;
  }

  /**
   * Export metrics to JSON format
   */
  async exportMetricsToJSON(communityId: string): Promise<any> {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: {
        metrics: true,
        community: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!pack) {
      throw new Error('Pack not found');
    }

    return {
      community: {
        name: pack.community.name,
        slug: pack.community.slug,
      },
      packType: pack.packType,
      exportDate: new Date().toISOString(),
      metrics: pack.metrics.map((metric) => ({
        key: metric.metricKey,
        name: metric.metricName,
        currentValue: metric.currentValue,
        targetValue: metric.targetValue,
        unit: metric.unit,
        period: metric.period,
        history: metric.history,
        updatedAt: metric.updatedAt,
      })),
    };
  }

  /**
   * Generate simple text report
   */
  async generateTextReport(communityId: string): Promise<string> {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: {
        metrics: true,
        community: {
          select: {
            name: true,
            slug: true,
          },
        },
        setupSteps: true,
      },
    });

    if (!pack) {
      throw new Error('Pack not found');
    }

    const completedSteps = pack.setupSteps.filter((s) => s.completed).length;
    const totalSteps = pack.setupSteps.length;

    let report = `
╔════════════════════════════════════════════════════════════════╗
║          REPORTE DE MÉTRICAS - ${pack.community.name.toUpperCase().padEnd(27)}║
╚════════════════════════════════════════════════════════════════╝

Fecha de generación: ${new Date().toLocaleString('es-ES')}
Tipo de Pack: ${this.getPackTypeName(pack.packType)}
Progreso de configuración: ${pack.setupProgress}% (${completedSteps}/${totalSteps} pasos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MÉTRICAS ACTUALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    for (const metric of pack.metrics) {
      const targetStr = metric.targetValue
        ? ` / ${metric.targetValue} ${metric.unit || ''} (objetivo)`
        : '';

      const progress = metric.targetValue
        ? `  [${this.getProgressBar((metric.currentValue / metric.targetValue) * 100)}]`
        : '';

      report += `
  ${metric.metricName}
  ${metric.currentValue} ${metric.unit || ''}${targetStr}${progress}
  Última actualización: ${new Date(metric.updatedAt).toLocaleString('es-ES')}
`;
    }

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return report;
  }

  /**
   * Helper to escape CSV fields
   */
  private escapeCsvField(field: string): string {
    if (!field) return '';
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Get pack type display name
   */
  private getPackTypeName(packType: string): string {
    const names = {
      CONSUMER_GROUP: 'Grupo de Consumo',
      HOUSING_COOP: 'Cooperativa de Vivienda',
      COMMUNITY_BAR: 'Bar Comunitario',
    };
    return names[packType] || packType;
  }

  /**
   * Generate progress bar
   */
  private getProgressBar(percentage: number, length: number = 20): string {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage.toFixed(0)}%`;
  }
}
