// Admin Dashboard Types and Interfaces

// Posts
export type PostType = "Announcement" | "Event" | "Matrimony Notice" | "Important Update" | "General Post";
export type PostPriority = "Normal" | "High Priority" | "Emergency";
export type PostVisibility = "All Users" | "Logged-in Only";
export type PostStatus = "Draft" | "Published" | "Scheduled" | "Archived";

export interface AdminPost {
  id: string;
  title: string;
  content: string;
  type: PostType;
  priority: PostPriority;
  visibility: PostVisibility;
  status: PostStatus;
  isPinned: boolean;
  publishedDate: string | null;
  expiryDate: string | null;
  image?: string;
  attachments?: string[];
  displayOn: {
    homePage: boolean;
    dashboard: boolean;
    notificationPanel: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

// Matrimony
export type MatrimonyStatus = "pending" | "approved" | "rejected" | "changes_requested";

export interface MatrimonyProfile {
  id: string;
  userId: string;
  userEmail: string;
  status: MatrimonyStatus;
  profileFor: string;
  fullName: string;
  dob: string;
  age?: number;
  gender: string;
  height: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  income?: string;
  gotra?: string;
  religion?: string;
  caste?: string;
  location: string;
  about?: string;
  lookingFor?: string;
  phone: string;
  preferredContactTime?: string;
  photoURL?: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  changeRequests?: string;
  createdAt: string;
  updatedAt: string;
}

// User Directory
export interface DirectoryEntry {
  id: string;
  name: string;
  profession: string;
  location: string;
  phone: string;
  email: string;
  bio?: string;
  photoURL?: string;
  isApproved: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// CMS Content
export type CMSContentType = "introduction" | "history" | "committee" | "events" | "gallery";

export interface CMSContent {
  id: string;
  type: CMSContentType;
  title: string;
  content: string;
  imageURLs?: string[];
  version: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedByName?: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  timestamp: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  approvedMatrimonyProfiles: number;
  pendingApprovals: number;
  activePosts: number;
  directoryEntries: number;
}

// Admin User
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "super_admin";
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Filters
export interface PostFilters {
  type?: PostType;
  status?: PostStatus;
  priority?: PostPriority;
  startDate?: string;
  endDate?: string;
}

export interface MatrimonyFilters {
  status?: MatrimonyStatus;
  gender?: string;
  location?: string;
  occupation?: string;
  ageMin?: number;
  ageMax?: number;
}

export interface DirectoryFilters {
  name?: string;
  profession?: string;
  location?: string;
  isApproved?: boolean;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
