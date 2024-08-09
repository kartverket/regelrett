import {
  CellContext,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import {
  Field,
  OptionalField,
  OptionalFieldType,
  Question,
} from '../api/types';
import { useColumnVisibility } from '../hooks/useColumnVisibility';

import { formatDateTime } from '../utils/formatTime';
import { Comment } from './table/Comment';
import { DataTable } from './table/DataTable';
import { DataTableCell } from './table/DataTableCell';
import { DataTableHeader } from './table/DataTableHeader';
import { TableCell } from './table/TableCell';

type TableComponentProps = {
  data: Question[];
  fields: Field[];
};

export function TableComponent({ data, fields }: TableComponentProps) {
  const params = useParams();
  const team = params.teamName;

  const [
    columnVisibility,
    setColumnVisibility,
    unHideColumn,
    unHideColumns,
    hasHiddenColumns,
    showOnlyFillModeColumns,
    getShownColumns,
  ] = useColumnVisibility();

  const columns: ColumnDef<any, any>[] = fields.map((field, index) => ({
    header: ({ column }) => (
      <DataTableHeader
        column={column}
        header={field.name}
        setColumnVisibility={setColumnVisibility}
      />
    ),
    id: field.name,

    accessorFn: (row: Question) => {
      if (!row.metadata.optionalFields) {
        return null;
      }
      const out = row.metadata.optionalFields.find(
        (op: OptionalField) => op.key === field.name
      );

      if (out) {
        return out.value.join(',');
      }
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

  columns.push({
    header: ({ column }) => {
      return (
        <DataTableHeader
          column={column}
          header={'Når'}
          setColumnVisibility={setColumnVisibility}
        />
      );
    },
    id: 'Når',
    accessorFn: (row) => row.answers[0]?.updated ?? '',
    cell: ({ cell, getValue, row }: CellContext<any, any>) => (
      <DataTableCell cell={cell}>
        <TableCell
          row={row}
          value={getValue() ? formatDateTime(getValue()) : 'Ikke oppdatert'}
          column={{
            name: 'Når',
            type: OptionalFieldType.DATE,
            options: null,
          }}
        />
      </DataTableCell>
    ),
  });

  const commentColumn: ColumnDef<any, any> = {
    header: ({ column }) => {
      return (
        <DataTableHeader
          column={column}
          header={'Kommentar'}
          setColumnVisibility={setColumnVisibility}
        />
      );
    },
    id: 'Kommentar',
    accessorFn: (row: Question) => row.comments[0]?.comment ?? '',
    cell: ({ cell, getValue, row }: CellContext<any, any>) => (
      <DataTableCell cell={cell}>
        <Comment
          comment={getValue()}
          questionId={row.original.id}
          team={team}
        />
      </DataTableCell>
    ),
  };

  // Find the index of the column where field.name is "Svar"
  const svarIndex = columns.findIndex((column) => column.id === 'Svar');

  // If the column is found, inject the new column right after it
  if (svarIndex !== -1) {
    columns.splice(svarIndex + 1, 0, commentColumn);
  } else {
    // If not found, push it at the end (or handle it differently as needed)
    columns.push(commentColumn);
  }

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
  return (
    <DataTable
      table={table}
      unHideColumn={unHideColumn}
      unHideColumns={unHideColumns}
      hasHiddenColumns={hasHiddenColumns}
      showOnlyFillModeColumns={showOnlyFillModeColumns}
      getShownColumns={getShownColumns}
    />
  );
}
