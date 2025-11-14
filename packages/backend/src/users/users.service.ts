import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.User.findUnique({
      where: { id },
      include: {
        Skill: true,
        Badge: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.User.findUnique({ where: { email } });
  }

  async update(id: string, requestingUserId: string, data: any) {
    // Check if user is updating their own profile
    if (id !== requestingUserId) {
      // Check if requesting user is an admin
      const requestingUser = await this.prisma.User.findUnique({
        where: { id: requestingUserId },
        select: { role: true },
      });

      if (!requestingUser || requestingUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    return this.prisma.User.update({
      where: { id },
      data,
    });
  }

  async getProfile(id: string) {
    return this.prisma.User.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        credits: true,
        semillaBalance: true,
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
        Skill: true,
        Badge: true,
        generosityScore: true,
        flowPower: true,
        communityId: true,
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            lat: true,
            lng: true,
          },
        },
      },
    });
  }

  async searchByEmail(email: string) {
    return this.prisma.User.findFirst({
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
