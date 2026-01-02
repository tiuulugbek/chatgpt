// Shared types for Soundz CRM

export type UserRole = 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'BRANCH_STAFF' | 'MARKETING' | 'SUPPORT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
  region?: string;
}

export interface Lead {
  id: string;
  title: string;
  status: string;
  source: string;
  branchId: string;
  contactId?: string;
  assigneeId?: string;
}

export interface Deal {
  id: string;
  title: string;
  amount?: number;
  stage: string;
  branchId: string;
}



