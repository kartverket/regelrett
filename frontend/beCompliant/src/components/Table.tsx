import {
  CellContext,
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  useReactTable,
} from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { Comment } from './table/Comment';
import { DataTable } from './table/DataTable';
import { DataTableCell } from './table/DataTableCell';
import { DataTableHeader } from './table/DataTableHeader';
import { TableCell } from './table/TableCell';
import { OptionalField, Question, Table, User } from '../api/types';
import { getSortFuncForColumn } from './table/TableSort';

type Props = {
  data: Question[];
  tableData: Table;
  user: User;
};

export function TableComponent({ data, tableData, user }: Props) {
  const params = useParams();
  const team = params.teamId;
  const contextId = params.contextId;
  const functionId = params.functionId
    ? Number.parseInt(params.functionId)
    : undefined;

  const [
    columnVisibility,
    setColumnVisibility,
    unHideColumn,
    unHideColumns,
    hasHiddenColumns,
    showOnlyFillModeColumns,
    getShownColumns,
  ] = useColumnVisibility();

  const columns: ColumnDef<any, any>[] = tableData.columns.map(
    (field, index) => ({
      header: ({ column }) => (
        <DataTableHeader
          column={column}
          header={field.name}
          setColumnVisibility={setColumnVisibility}
          minWidth={field.name.toLowerCase() === 'id' ? '120px' : undefined}
        />
      ),
      id: field.name,
      accessorFn: (row: Question) => {
        if (row.metadata.optionalFields) {
          return row.metadata.optionalFields.find(
            (col) => col.key === field.name
          );
        } else {
          return null;
        }
      },
      cell: ({ cell, getValue, row }: CellContext<any, any>) => (
        <DataTableCell cell={cell}>
          <TableCell
            tableId={tableData.id}
            value={getValue()}
            column={field}
            row={row}
            answerable={index == 3}
            user={user}
          />
        </DataTableCell>
      ),
      sortingFn: (a, b, columnId) => {
        const valueA =
          (
            a.getValue(columnId) as OptionalField | null
          )?.value?.[0]?.toLowerCase() || '';

        const valueB =
          (
            b.getValue(columnId) as OptionalField | null
          )?.value?.[0]?.toLowerCase() || '';

        const sortFunc = getSortFuncForColumn(columnId);
        return sortFunc(valueA, valueB);
      },
    })
  );

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
    accessorFn: (row: Question) => row.comments.at(-1)?.comment ?? '',
    cell: ({ cell, getValue, row }: CellContext<any, any>) => (
      <DataTableCell cell={cell}>
        <Comment
          comment={getValue()}
          recordId={row.original.recordId}
          tableId={tableData.id}
          questionId={row.original.id}
          updated={row.original.comments.at(-1)?.updated}
          team={team}
          functionId={functionId}
          contextId={contextId}
          user={user}
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

  const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const searchTerm = String(filterValue).toLowerCase();

    const { id, metadata } = row.original;
    const { optionalFields } = metadata;

    const getFieldValue = (key: string): string => {
      const field = optionalFields.find(
        (field: { key: string }) => field.key === key
      );
      return field?.value[0]?.toLowerCase() || '';
    };

    const rowData = {
      id: String(id).toLowerCase(),
      kortnavn: getFieldValue('Kortnavn'),
      sikkerhetskontroller: getFieldValue('Sikkerhetskontroller'),
    };

    return Object.values(rowData).some((field) => field.includes(searchTerm));
  };

  const table = useReactTable({
    columns: columns,
    data: data,
    state: {
      columnVisibility,
    },
    autoResetAll: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalFilterFn,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return (
    <DataTable<RowData>
      table={table}
      unHideColumn={unHideColumn}
      unHideColumns={unHideColumns}
      hasHiddenColumns={hasHiddenColumns}
      showOnlyFillModeColumns={showOnlyFillModeColumns}
      getShownColumns={getShownColumns}
    />
  );
}
