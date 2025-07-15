export interface EventWithDetails {
  id: string;
  title: string;
  description?: string;
  category: string;
  startDatetime: Date;
  endDatetime?: Date;
  city: string;
  imageUrl?: string;
  establishmentId: string;
  incentives?: Incentive[];
  stats?: EventStats;
}

export interface Incentive {
  id: string;
  title: string;
  type: string;
  description?: string;
  totalQuantity?: number;
  availableQuantity?: number;
}

export interface EventStats {
  totalInterested: number;
  totalCheckedIn: number;
  reactionCounts: Record<string, number>;
}

export interface UserReaction {
  id: string;
  userId: string;
  eventId: string;
  reaction: 'EU_VOU_COMPARECER' | 'PENSANDO_EM_IR' | 'NAO_VOU_PODER_IR';
  createdAt: Date;
}

export interface CheckIn {
  id: string;
  userId: string;
  eventId: string;
  promoterId?: string;
  qrCode: string;
  validated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
  checkinTime: Date;
}

export interface UserStats {
  id: string;
  userId: string;
  totalCheckIns: number;
  monthlyCheckIns: number;
  level: string;
  points: number;
  availableRewards: number;
  updatedAt: Date;
}

export type EventCategory = 'PAGODE' | 'ROCK' | 'SERTANEJO' | 'FUNK' | 'FORRÓ' | 'TECHNO' | 'SAMBA';

export type UserRole = 'SUPER_ADMIN' | 'DONO_ESTABELECIMENTO' | 'FUNCIONARIO' | 'PROMOTER' | 'USUARIO';
