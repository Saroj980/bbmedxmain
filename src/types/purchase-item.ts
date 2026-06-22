// export type PurchaseItem = {
//   id: string;
//   product_id: number | null;
//   batch_no: string;
//   expiry_date: string | null;
//   quantity: number;
//   cost_price: number;
  // vat_included: boolean;
  // vat_amount: number;
//   profit_margin?: number | null;
//   selling_price: number;
// };

export type PurchaseItem = {
  id: string;
  product_id: number | null;
  location_id: number | null;
  batch_no: string;
  manufactured_date: string | null;
  expiry_mode: "date" | "shelf_life";
  expiry_date: string | null;
  shelf_life_value?: number | null;
  shelf_life_unit?: "days" | "months" | "years" | null;
  quantity: number;
  cost_price: number;
  profit_margin?: number | null;
  selling_price: number;
  auto_calculate: boolean;
  vat_included: boolean;
  // vat_included: boolean;
  vat_amount: number;
};
