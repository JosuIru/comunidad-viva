import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async searchAll(params: {
    query?: string;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lng?: number;
    radius?: number; // in km
    sortBy?: 'relevance' | 'distance' | 'price' | 'date';
  }) {
    const { query, type, category, minPrice, maxPrice, lat, lng, radius = 10, sortBy = 'relevance' } = params;

    // Search offers
    const offerWhere: any = {};

    if (query) {
      offerWhere.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ];
    }

    if (type) {
      offerWhere.type = type;
    }

    if (category) {
      offerWhere.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      offerWhere.priceEur = {};
      if (minPrice !== undefined) offerWhere.priceEur.gte = minPrice;
      if (maxPrice !== undefined) offerWhere.priceEur.lte = maxPrice;
    }

    let offers = await this.prisma.offer.findMany({
      where: offerWhere,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      take: 50,
    });

    // Filter by distance if coordinates provided
    if (lat && lng) {
      offers = offers
        .map((offer) => ({
          ...offer,
          distance: offer.lat && offer.lng
            ? this.calculateDistance(lat, lng, offer.lat, offer.lng)
            : Infinity,
        }))
        .filter((offer) => offer.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    // Search events
    const eventWhere: any = {};

    if (query) {
      eventWhere.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    let events = await this.prisma.event.findMany({
      where: eventWhere,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      take: 20,
    });

    // Filter events by distance
    if (lat && lng) {
      events = events
        .map((event) => ({
          ...event,
          distance: event.lat && event.lng
            ? this.calculateDistance(lat, lng, event.lat, event.lng)
            : Infinity,
        }))
        .filter((event) => event.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    return {
      offers,
      events,
      totalResults: offers.length + events.length,
    };
  }

  async searchOffers(params: {
    query?: string;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    const result = await this.searchAll(params);
    return result.offers;
  }

  async searchEvents(params: {
    query?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    const result = await this.searchAll(params);
    return result.events;
  }
}
