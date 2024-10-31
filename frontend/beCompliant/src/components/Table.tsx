import {
  CellContext,
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowData,
  useReactTable,
} from '@tanstack/react-table';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { Comment } from './table/Comment';
import { DataTable } from './table/DataTable';
import { DataTableCell } from './table/DataTableCell';
import { DataTableHeader } from './table/DataTableHeader';
import { TableCell } from './table/TableCell';
import { OptionalField, Question, Table, User } from '../api/types';
import { getSortFuncForColumn } from './table/TableSort';
import { useEffect } from 'react';

type Props = {
  data: Question[];
  tableData: Table;
  user: User;
  contextId: string;
};

export function TableComponent({ data, tableData, contextId, user }: Props) {
  const [
    columnVisibility,
    setColumnVisibility,
    unHideColumn,
    unHideColumns,
    hasHiddenColumns,
    showOnlyFillModeColumns,
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
            contextId={contextId}
            value={getValue()}
            column={field}
            row={row}
            answerable={index == 3}
            user={user}
          />
        </DataTableCell>
      ),
      sortingFn: (a: Row<Question>, b: Row<Question>, columnId) => {
        const getLastUpdatedTime = (row: Row<Question>) =>
          row.original.answers?.at(-1)?.updated?.getTime() ?? 0;
        if (columnId === 'Svar') {
          return getLastUpdatedTime(a) - getLastUpdatedTime(b);
        }

        const getValue = (row: Row<Question>) => {
          return (
            (
              row.getValue(columnId) as OptionalField | null
            )?.value?.[0]?.toLowerCase() || ''
          );
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

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
          questionId={row.original.id}
          updated={row.original.comments.at(-1)?.updated}
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
    console.log(searchTerm);

    const optionalFields = row.original.metadata?.optionalFields;

    const getFieldValue = (index: number): string => {
      return optionalFields[index]?.value[0]?.toLowerCase() || '';
    };

    const rowData = {
      field0: getFieldValue(0),
      field1: getFieldValue(1),
      field2: getFieldValue(2),
    };

    return Object.values(rowData).some((field) => field.includes(searchTerm));
  };

  const table = useReactTable({
    columns: columns,
    data: data,
    state: {
      columnVisibility,
    },
    autoResetAll: true,
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

  const { globalFilter, pagination } = table.getState();
  console.log(table.getState());

  useEffect(() => {
    //console.log(table.getState());

    console.log(pagination.pageIndex);
    console.log(globalFilter);
    console.log(Object.keys(table.getState().columnFilters));

    if (
      pagination.pageIndex === 0 &&
      (globalFilter || Object.keys(table.getState().columnFilters).length > 0)
    ) {
      console.log('test');

      window.scrollTo(0, 0);
    }
  }, [pagination.pageIndex, globalFilter, table.getState().columnFilters]);

  return (
    <DataTable<RowData>
      table={table}
      unHideColumn={unHideColumn}
      unHideColumns={unHideColumns}
      hasHiddenColumns={hasHiddenColumns}
      showOnlyFillModeColumns={showOnlyFillModeColumns}
    />
  );
}
