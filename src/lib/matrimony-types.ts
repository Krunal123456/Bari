export type Gender = 'male' | 'female' | 'other';

export type ProfileStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface MatrimonyProfile {
  id?: string;
  userId: string; // owner
  profileFor: string; // self / son / daughter etc
  fullName: string;
  gender: Gender;
  dob: string; // ISO date
  tob?: string; // time of birth HH:mm (optional)
  pob?: string; // place of birth
  height?: string;
  complexion?: string;
  education?: string;
  occupation?: string;
  income?: string;
  familyDetails?: string;
  about?: string;
  lookingFor?: string;
  photos?: string[]; // storage URLs
  kundli?: {
    generatedAt?: string;
    pdfUrl?: string;
    gunaScore?: number;
    manglik?: boolean;
    details?: any;
  } | null;
  isSpotlight?: boolean;
  premiumBadge?: boolean;
  status: ProfileStatus;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface Subscription {
  id?: string;
  userId: string;
  plan: 'free' | 'paid';
  startDate: string;
  expiryDate?: string | null;
  status: 'active' | 'expired' | 'cancelled';
  metadata?: Record<string, unknown>;
}

export interface Interest {
  id?: string;
  fromUserId: string;
  toProfileId: string;
  message?: string;
  createdAt?: string;
}

export interface MatchSummary {
  profileAId: string;
  profileBId: string;
  gunaScore?: number;
  manglikCompatible?: boolean;
  summary?: string;
  generatedAt?: string;
}
