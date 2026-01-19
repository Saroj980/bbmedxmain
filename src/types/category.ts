export interface Category {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  parent_name?: string | null;
  is_active?: boolean;
  children: Category[];
  depth?: number;     // <-- for tree indentation
  hasChildren?: boolean;
}
