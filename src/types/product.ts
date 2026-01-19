/* eslint-disable @typescript-eslint/no-explicit-any */

// export interface Product {
//   id: number;
//   name: string;
//   sku: string;
//   category_id: number | null;
//   unit_id: number | null;
//   is_active: boolean;
//   meta: Record<string, any>;
//   category?: any;
//   unit?: any;
// }

export interface Product {
  id: number;
  name: string;
  sku: string;

  category_id?: number | null;
  is_active: boolean;
  meta?: Record<string, any>;

  category?: Category;

  // ✅ IMPORTANT: units is an ARRAY, not unit_id
  units: ProductUnit[];
}


export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  parent_name?: string | null;
  children?: Category[];
}

export interface Unit {
  id: number;
  name: string;
  short_code?: string;
  parent_id?: number | null;
}

export interface ProductUnit {
  level: number;
  conversion_factor: number;
  unit: string;
  unit_code: string;
}


export interface ProductFieldDefinition {
  id: number;
  key: string;
  label: string;
  type: string;
  options?: string[] | { label: string; value: string }[];
  validation?: any;
  required?: boolean;
  applies_to?: number[] | null;
  order?: number;
}

export interface ProductFieldValue {
  [key: string]: any;
}

export interface VariationLevel {
  level: number;         // 0 = top (package) ... or 1 = top (you choose)
  unit_id: number | null;
  unit_name?: string;
  ratioToParent?: number; // ratio: how many of this unit equals 1 of parent (parent -> child)
}
