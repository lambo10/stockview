export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'cashier';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
