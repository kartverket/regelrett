import {
  Flex,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@kvib/react';
import {
  CellContext,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataTable } from './table/DataTable';
import { DataTableCell } from './table/DataTableCell';
import { DataTableHeader } from './table/DataTableHeader';
import { TableCell } from './table/TableCell';
import { RecordType, Field, Choice } from '../types/tableTypes';

type TableComponentProps = {
  data: RecordType[];
  fields: Field[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
};

export function TableComponent({
  data,
  fields,
  columnVisibility,
  setColumnVisibility,
}: TableComponentProps) {
  const columns: ColumnDef<any, any>[] = fields.map((field, index) => ({
    header: ({ column }) => (
      <DataTableHeader
        column={column}
        header={field.name}
        setColumnVisibility={setColumnVisibility}
      />
    ),
    id: field.name,
    accessorFn: (row) => {
      return Array.isArray(row.fields[field.name])
        ? row.fields[field.name].join(',')
        : row.fields[field.name];
    },
    cell: ({ cell, getValue, row }: CellContext<any, any>) => (
      <DataTableCell cell={cell}>
        <TableCell
          value={getValue()}
          column={field}
          row={row}
          answerable={index == 3}
        />
      </DataTableCell>
    ),
  }));

  const table = useReactTable({
    columns: columns,
    data: data,
    state: {
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return <DataTable table={table} />;
}
