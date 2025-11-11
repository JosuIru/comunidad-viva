import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark a route as requiring ownership verification
 * @param resourceType - The type of resource to check ownership for (e.g., 'offer', 'event', 'proposal')
 *
 * @example
 * @UseGuards(JwtAuthGuard, OwnershipGuard)
 * @CheckOwnership('offer')
 * @Patch(':id')
 * async updateOffer(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
 *   // Only the owner can update the offer
 * }
 */
export const CheckOwnership = (resourceType: string) => SetMetadata('resourceType', resourceType);
