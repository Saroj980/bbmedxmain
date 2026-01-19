/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";

export type PaginationState = {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export interface DataTableProps<T> {
  title: string;
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  breadcrumbs?: string[]; 
  pageSize?: number;
  disablePagination?: boolean;
  emptyMessage: null | string;
  pagination?: PaginationState; 
}
