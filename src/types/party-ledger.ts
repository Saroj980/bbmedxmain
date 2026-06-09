export interface PartyLedger {
  id: number;
  name: string;
  code: string;
  type?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  account_id: number;
  account?: {
    id: number;
    type: string;
    current_balance?: number;
    opening_balance?: number;
    opening_balance_type?: string;
  };
}