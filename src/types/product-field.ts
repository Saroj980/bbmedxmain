/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ProductFieldDefinition {
  id: number;
  key: string;
  label: string;
  type: string;
  options?: string[] | null;
  validation?: Record<string, any> | null;
  required: boolean;
  applies_to?: number[] | null;
  order: number | null;
  dictionary: string | null;
}
