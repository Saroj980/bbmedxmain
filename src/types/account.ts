export type Account = {
  id: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "income" | "expense" | "equity";
  parent_id: number | null;
  is_active: boolean;
  is_system: boolean;

  // tree helpers
  children?: Account[];
  depth?: number;
  hasChildren?: boolean;
  can_receive_payment?: boolean;
  can_make_payment?: boolean;
  category?: string;
  opening_balance?: number;
  opening_balance_type?: "dr" | "cr";
};
