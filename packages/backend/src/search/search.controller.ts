import { Controller, Get, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search offers and events' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lng', required: false })
  @ApiQuery({ name: 'radius', required: false })
  async search(
    @Query('q') query?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.searchService.searchAll({
      query,
      type,
      category,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
    });
  }

  @Get('geocode')
  @ApiOperation({ summary: 'Geocode location search (proxy to Nominatim)' })
  @ApiQuery({ name: 'q', required: true, description: 'Location search query' })
  async geocode(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      throw new HttpException('Query parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=es&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ComunidadViva/1.0 (https://comunidadviva.app)',
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          'Nominatim API error',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Geocoding failed', error.stack, { location });
      throw new HttpException(
        'Failed to geocode location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
