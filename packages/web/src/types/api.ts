/**
 * Common API types and interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  reputation: number;
  level: number;
  credits: number;
  joinedAt: string;
  isEmailVerified: boolean;
  roles?: string[];
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  memberCount: number;
  location?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  location?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'PRODUCT' | 'SERVICE' | 'SKILL';
  price?: number;
  priceCredits?: number;
  isFree: boolean;
  images: string[];
  location?: string;
  userId: string;
  user?: User;
  communityId?: string;
  community?: Community;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  interestedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  address: string;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt?: string;
  capacity?: number;
  category?: string;
  type?: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
  creditsReward?: number;
  tags: string[];
  requirements: string[];
  organizerId: string;
  organizer?: User;
  communityId?: string;
  community?: Community;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  registrationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  content: string;
  images: string[];
  userId: string;
  user?: User;
  communityId?: string;
  community?: Community;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MutualAidNeed {
  id: string;
  scope: 'INDIVIDUAL' | 'FAMILY' | 'COMMUNITY';
  type: string;
  title: string;
  description: string;
  location?: string;
  urgencyLevel: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CLOSED';
  resourceTypes: string[];
  targetEur?: number;
  currentEur?: number;
  targetCredits?: number;
  currentCredits?: number;
  targetHours?: number;
  currentHours?: number;
  neededSkills: string[];
  contributorsCount: number;
  creatorId: string;
  creator?: User;
  communityId?: string;
  community?: Community;
  createdAt: string;
  updatedAt: string;
}

export interface MutualAidProject {
  id: string;
  type: string;
  title: string;
  description: string;
  vision?: string;
  location: string;
  country: string;
  status: 'PLANNING' | 'FUNDING' | 'IN_PROGRESS' | 'COMPLETED';
  targetEur?: number;
  currentEur?: number;
  targetCredits?: number;
  currentCredits?: number;
  beneficiaries?: number;
  volunteersNeeded?: number;
  volunteersEnrolled?: number;
  estimatedMonths?: number;
  impactGoals: string[];
  sdgGoals: number[];
  tags: string[];
  images: string[];
  isVerified: boolean;
  contributorsCount: number;
  creatorId: string;
  creator?: User;
  communityId?: string;
  community?: Community;
  updates?: ProjectUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface HousingSolution {
  id: string;
  solutionType: 'SPACE_BANK' | 'TEMPORARY_HOUSING' | 'HOUSING_COOP' | 'COMMUNITY_GUARANTEE';
  title: string;
  description: string;
  location: string;
  capacity?: number;
  images: string[];
  ownerId: string;
  owner?: User;
  communityId?: string;
  community?: Community;
  status: 'AVAILABLE' | 'OCCUPIED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
  isVisible: boolean;
}

/**
 * API Query Parameters
 */

export interface OffersQueryParams extends PaginationParams {
  type?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  communityId?: string;
  userId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
}

export interface EventsQueryParams extends PaginationParams {
  category?: string;
  search?: string;
  communityId?: string;
  userId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export interface HousingQueryParams extends PaginationParams {
  solutionType?: 'SPACE_BANK' | 'TEMPORARY_HOUSING' | 'HOUSING_COOP' | 'COMMUNITY_GUARANTEE';
  search?: string;
  communityId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'INACTIVE';
  minCapacity?: number;
  maxCapacity?: number;
}

export interface MutualAidQueryParams extends PaginationParams {
  scope?: 'INDIVIDUAL' | 'FAMILY' | 'COMMUNITY';
  type?: string;
  search?: string;
  communityId?: string;
  sdg?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  status?: 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CLOSED';
}

export interface CommunitiesQueryParams extends PaginationParams {
  type?: string;
  visibility?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

/**
 * Form Data Types
 */

export interface CreateOfferFormData {
  title: string;
  description: string;
  category: string;
  type: 'PRODUCT' | 'SERVICE' | 'SKILL';
  priceEur?: number;
  priceCredits?: number;
  isFree: boolean;
  images: File[];
  location?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
}

export interface CreateEventFormData {
  title: string;
  description: string;
  image?: File;
  address: string;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt?: string;
  capacity?: number;
  category?: string;
  type: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
  creditsReward?: number;
  tags: string[];
  requirements: string[];
}
