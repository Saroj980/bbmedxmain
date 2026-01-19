export interface Location {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name?: string | null;
  level: number;
  is_active: boolean;
  children?: Location[];
  hasChildren?: boolean;
}
