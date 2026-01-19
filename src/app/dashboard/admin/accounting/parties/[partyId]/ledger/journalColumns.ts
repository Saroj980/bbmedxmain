import { ColumnDef } from "@tanstack/react-table";

export type JournalRow = {
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export const journalColumns: ColumnDef<JournalRow>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "debit",
    header: "Debit",
    cell: ({ row }) =>
      row.original.debit > 0 ? row.original.debit : "-",
  },
  {
    accessorKey: "credit",
    header: "Credit",
    cell: ({ row }) =>
      row.original.credit > 0 ? row.original.credit : "-",
  },
  
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const b = row.original.balance;
      return (
        <span
          className={
            b >= 0
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {Math.abs(b)} {b >= 0 ? "Dr" : "Cr"}
        </span>
      );
    },
  },
];
