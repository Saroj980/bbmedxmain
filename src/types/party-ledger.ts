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
}