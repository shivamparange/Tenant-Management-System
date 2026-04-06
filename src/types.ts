export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance';
export type PropertyType = 'room' | 'flat' | 'villa' | 'gala' | 'farmhouse';

export interface User {
  id?: string;
  uid?: string | number;
  name: string;
  email: string;
  mobile?: string;
  photo: string;
  role?: 'admin' | 'manager' | 'tenant';
}

export interface RentPaymentRecord {
  id: string;
  month: string; // e.g. "2023-01"
  amount: number;
  paymentDate?: string;
  status: 'paid' | 'unpaid';
}

export interface TenantHistoryRecord {
  id: string;
  tenantName: string;
  phoneNumber: string;
  moveInDate: string;
  moveOutDate?: string;
  rentAmount: number;
  deposit: number;
  email?: string;
  password?: string;
  user_id?: string | number;
  notes?: string;
  payments?: RentPaymentRecord[];
}

export interface Property {
  id: string;
  name: string;
  unitNumber?: string;
  type: PropertyType;
  address: string;
  rent: number;
  status: PropertyStatus;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenantPassword?: string;
  tenant_id?: string | number;
  notes?: string;
  lightBillNumber?: string;
  createdAt: number;
  history?: TenantHistoryRecord[];
  nextPaymentDate?: string;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  imageUrl?: string;
}

export interface Complaint {
  id: string;
  user_id?: string;
  tenant_id?: string;
  property_id: string;
  issue_type: string;
  description: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Resolved' | 'Rejected';
  created_at: string;
  tenant_name?: string;
  property_name?: string;
}
