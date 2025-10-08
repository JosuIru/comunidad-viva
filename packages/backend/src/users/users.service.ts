import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        skills: true,
        badges: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        credits: true,
        level: true,
        experience: true,
        totalSaved: true,
        hoursShared: true,
        hoursReceived: true,
        co2Avoided: true,
        peopleHelped: true,
        peopleHelpedBy: true,
        connectionsCount: true,
        address: true,
        neighborhood: true,
        interests: true,
        skills: true,
        badges: true,
        generosityScore: true,
        flowPower: true,
      },
    });
  }

  async searchByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        credits: true,
      },
    });
  }
}
