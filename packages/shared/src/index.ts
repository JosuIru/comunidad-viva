// packages/shared/types/index.ts

// ============= ENUMS =============
export enum UserRole {
  CITIZEN = 'CITIZEN',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  PUBLIC_ENTITY = 'PUBLIC_ENTITY'
}

export enum OfferType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  TIME_BANK = 'TIME_BANK',
  GROUP_BUY = 'GROUP_BUY',
  EVENT = 'EVENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum CreditReason {
  TIME_BANK_HOUR = 'TIME_BANK_HOUR',
  LOCAL_PURCHASE = 'LOCAL_PURCHASE',
  EVENT_ATTENDANCE = 'EVENT_ATTENDANCE',
  REFERRAL = 'REFERRAL',
  ECO_ACTION = 'ECO_ACTION',
  COMMUNITY_HELP = 'COMMUNITY_HELP',
  DAILY_SEED = 'DAILY_SEED'
}

// ============= CORE TYPES =============
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  location: GeoLocation;
  skills: Skill[];
  reputation: ReputationScore;
  credits: number;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  neighborhood?: string;
  radius?: number; // km para búsquedas
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  description?: string;
  verified: boolean;
  endorsements: number;
}

export interface ReputationScore {
  overall: number; // 0-5
  helpGiven: number;
  helpReceived: number;
  reliability: number; // % de compromisos cumplidos
  responseTime: number; // horas promedio
  badges: Badge[];
}

export interface Badge {
  id: string;
  type: 'HELPER' | 'ORGANIZER' | 'ECO' | 'CONNECTOR' | 'PIONEER';
  name: string;
  icon: string;
  earnedAt: Date;
  description: string;
}

export interface UserStats {
  totalSaved: number; // euros
  hoursShared: number;
  hoursReceived: number;
  co2Avoided: number; // kg
  peopleHelped: number;
  peopleHelpedBy: number;
  connectionsMade: number;
  activeStreak: number; // días
  weeklyMood?: 'AVAILABLE' | 'LEARNING' | 'ORGANIZING' | 'RESTING';
}

export interface UserPreferences {
  notifications: NotificationPrefs;
  privacy: PrivacySettings;
  interests: string[];
  availableHours: WeeklySchedule;
  maxDistance: number; // km
  language: 'es' | 'ca' | 'eu' | 'gl' | 'en';
  dailySeeds: boolean; // micro-retos diarios
}

// ============= OFFERS & MARKETPLACE =============
export interface Offer {
  id: string;
  userId: string;
  user?: User;
  type: OfferType;
  category: string;
  title: string;
  description: string;
  images: string[];
  priceEur?: number;
  priceCredits?: number;
  location: GeoLocation;
  availability: Availability;
  tags: string[];
  stats: OfferStats;
  groupBuyDetails?: GroupBuyDetails;
  timeBankDetails?: TimeBankDetails;
  eventDetails?: any;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';
  createdAt: Date;
  expiresAt?: Date;
}

export interface OfferStats {
  views: number;
  interested: number;
  supporters: number; // "apoyo" count
  shareCount: number;
  savedBy: number;
  completedTransactions: number;
}

export interface GroupBuyDetails {
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  priceBreaks: PriceBreak[];
  deadline: Date;
  pickupPoint: GeoLocation;
  organizer: User;
}

export interface PriceBreak {
  minQuantity: number;
  pricePerUnit: number;
  savings: number; // %
}

export interface TimeBankDetails {
  estimatedHours: number;
  skillRequired?: string;
  toolsNeeded?: string[];
  canTeach: boolean;
  maxStudents?: number;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

// ============= TRANSACTIONS =============
export interface TimeBankTransaction {
  id: string;
  requesterId: string;
  providerId: string;
  offer?: Offer;
  description: string;
  hours: number;
  credits: number;
  scheduledFor: Date;
  completedAt?: Date;
  status: TransactionStatus;
  ratings: {
    fromRequester?: Rating;
    fromProvider?: Rating;
  };
  impactStory?: string; // "Qué ha sido lo mejor"
  chainedFavor?: boolean; // Parte de cadena de favores
}

export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  totalEur: number;
  totalCredits: number;
  paymentMethod: 'CASH' | 'CARD' | 'CREDITS' | 'MIXED';
  pickupPoint?: GeoLocation;
  pickupTime?: Date;
  status: 'PENDING' | 'PAID' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positivo = ganado, negativo = gastado
  reason: CreditReason;
  description?: string;
  relatedId?: string; // ID de order/transaction/event
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// ============= SOCIAL & COMMUNITY =============
export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  images?: string[];
  location?: GeoLocation;
  type: 'STORY' | 'NEED' | 'OFFER' | 'THANKS' | 'ACHIEVEMENT';
  visibility: 'PUBLIC' | 'NEIGHBORS' | 'FRIENDS';
  tags: string[];
  mentions: string[]; // user IDs
  stats: PostStats;
  createdAt: Date;
  editedAt?: Date;
}

export interface PostStats {
  thanks: number; // en lugar de likes
  supports: number; // apoyos con créditos
  comments: number;
  shares: number;
  helped: number; // marcados como "esto me ayudó"
}

export interface CommunityMetrics {
  date: Date;
  area: string; // neighborhood/city
  activeUsers: number;
  newConnections: number;
  hoursExchanged: number;
  eurosSaved: number;
  creditsCirculated: number;
  co2Avoided: number;
  eventsHeld: number;
  groupBuysCompleted: number;
  helpChains: number; // cadenas de favor
  weeklyHighlight?: string; // historia destacada auto-generada
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  image?: string;
  location: GeoLocation;
  startsAt: Date;
  endsAt: Date;
  capacity?: number;
  attendees: EventAttendee[];
  creditsReward: number;
  tags: string[];
  type: 'WORKSHOP' | 'CLEANUP' | 'MARKET' | 'SOCIAL' | 'REPAIR_CAFE';
  requirements?: string[];
  createdAt: Date;
}

export interface EventAttendee {
  userId: string;
  user?: User;
  registeredAt: Date;
  checkedInAt?: Date;
  role: 'PARTICIPANT' | 'VOLUNTEER' | 'ORGANIZER';
  feedback?: string;
}

// ============= MERCHANT SPECIFIC =============
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  nif: string;
  category: string;
  description: string;
  logo?: string;
  images: string[];
  location: GeoLocation;
  schedule: WeeklySchedule;
  acceptsCredits: boolean;
  creditDiscount: number; // % max descuento con créditos
  supporters: number; // vecinos que apoyan
  sustainabilityScore?: number;
  certifications: string[];
  impactReport?: MerchantImpact;
  createdAt: Date;
}

export interface MerchantImpact {
  month: string;
  localPurchases: number;
  creditsAccepted: number;
  jobsCreated: number;
  localSuppliers: number;
  wasteReduced: number; // kg
  communityEvents: number;
}

// ============= GAMIFICATION & ENGAGEMENT =============
export interface DailySeed {
  id: string;
  date: Date;
  type: 'GREETING' | 'SHARING' | 'HELPING' | 'LEARNING' | 'CONNECTING';
  challenge: string;
  description: string;
  creditsReward: number;
  participantsCount: number;
  completed: boolean;
}

export interface HelpChain {
  id: string;
  initiatorId: string;
  links: ChainLink[];
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: Date;
  story?: string; // narrativa generada
}

export interface ChainLink {
  fromUserId: string;
  toUserId: string;
  action: string;
  timestamp: Date;
  message?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export enum NotificationType {
  HELP_REQUEST = 'HELP_REQUEST',
  HELP_OFFERED = 'HELP_OFFERED',
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
  GROUP_BUY_CLOSING = 'GROUP_BUY_CLOSING',
  EVENT_REMINDER = 'EVENT_REMINDER',
  CREDITS_EARNED = 'CREDITS_EARNED',
  CREDITS_EXPIRING = 'CREDITS_EXPIRING',
  COMMUNITY_MILESTONE = 'COMMUNITY_MILESTONE',
  NEIGHBOR_NEEDS = 'NEIGHBOR_NEEDS',
  WEEKLY_IMPACT = 'WEEKLY_IMPACT',
  BURNOUT_CARE = 'BURNOUT_CARE', // cuidado al super-ayudador
  CONNECTION_SUGGESTION = 'CONNECTION_SUGGESTION'
}

// ============= ADMIN & REPORTING =============
export interface ImpactReport {
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  startDate: Date;
  endDate: Date;
  area: string;
  metrics: {
    socialCohesion: {
      newConnections: number;
      repeatInteractions: number;
      averageInteractionsPerUser: number;
      isolationReduced: number; // usuarios que pasaron de 0 a 3+ conexiones
    };
    economicImpact: {
      totalSaved: number;
      localSpending: number;
      timeBankValue: number; // hours * 15€
      jobsCreated: number;
    };
    environmentalImpact: {
      co2Avoided: number;
      wasteReduced: number;
      repairsCompleted: number;
      localFoodPercent: number;
    };
    participation: {
      activeUsers: number;
      weeklyActiveUsers: number;
      retentionRate: number;
      nps: number;
      viralCoefficient: number;
    };
  };
  highlights: string[]; // historias destacadas auto-generadas
  nextActions: string[]; // recomendaciones basadas en datos
}

// ============= HELPERS =============
export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "13:00"
}

export interface Availability {
  type: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
  schedule?: WeeklySchedule;
  dates?: Date[];
  notes?: string;
}

export interface Rating {
  score: number; // 1-5
  comment?: string;
  tags?: string[]; // ['PUNCTUAL', 'FRIENDLY', 'SKILLED']
  wouldRepeat: boolean;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  sms: boolean;
  frequency: 'INSTANT' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  types: NotificationType[];
  quietHours: { start: string; end: string };
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'NEIGHBORS' | 'CONNECTIONS';
  showLocation: boolean;
  showStats: boolean;
  allowMessages: 'ALL' | 'CONNECTIONS' | 'NONE';
  shareDataForReports: boolean;
}

export interface OrderItem {
  offerId: string;
  offer?: Offer;
  quantity: number;
  priceEur: number;
  priceCredits: number;
  notes?: string;
}

// ============= API RESPONSES =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: Date;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}