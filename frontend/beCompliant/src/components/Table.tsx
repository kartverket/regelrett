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
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { Comment } from './table/Comment';
import { DataTable } from './table/DataTable';
import { DataTableCell } from './table/DataTableCell';
import { DataTableHeader } from './table/DataTableHeader';
import { TableCell } from './table/TableCell';
import { Column, OptionalField, Question, Table, User } from '../api/types';
import { getSortFuncForColumn } from './table/TableSort';
import { TableActions } from './tableActions/TableActions';
import { TableFilters } from './tableActions/TableFilter';
import { useEffect, useState } from 'react';
import { IconButton, Text } from '@kvib/react';
import { useNavigate } from 'react-router-dom';

type Props = {
  filters: TableFilters;
  tableMetadata: Column[];
  filterByAnswer: boolean;
  data: Question[];
  tableData: Table;
  user: User;
  contextId: string;
};

export function TableComponent({
  data,
  tableData,
  contextId,
  user,
  filters,
  tableMetadata,
  filterByAnswer,
}: Props) {
  const [
    columnVisibility,
    setColumnVisibility,
    unHideColumn,
    unHideColumns,
    hasHiddenColumns,
    showOnlyFillModeColumns,
  ] = useColumnVisibility();

  const navigate = useNavigate();

  const initialSorting: SortingState = JSON.parse(
    localStorage.getItem(`sortingState_${tableData.id}`) || '[]'
  );
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  useEffect(() => {
    localStorage.setItem(
      `sortingState_${tableData.id}`,
      JSON.stringify(sorting)
    );
  }, [sorting, tableData.id]);

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

  const emptyColumn: ColumnDef<any, any> = {
    header: ({ column }) => {
      return (
        <DataTableHeader
          column={column}
          header={''}
          setColumnVisibility={setColumnVisibility}
        />
      );
    },
    id: 'Se mer',
    cell: ({ cell, row }: CellContext<any, any>) => (
      <DataTableCell cell={cell}>
        <IconButton
          aria-label="se mer"
          icon="open_in_full"
          size="md"
          variant="ghost"
          onClick={() => navigate(`${row.original.recordId}`)}
        />
        <Text fontSize="sm" color="green.700">
          Se mer
        </Text>
      </DataTableCell>
    ),
  };
  columns.unshift(emptyColumn);

  const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const searchTerm = String(filterValue).toLowerCase();

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
      sorting,
    },
    onSortingChange: setSorting,
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
    <>
      <TableActions
        resetTable={table.reset}
        filters={filters}
        tableMetadata={tableMetadata}
        filterByAnswer={filterByAnswer}
      />
      <DataTable<RowData>
        table={table}
        unHideColumn={unHideColumn}
        unHideColumns={unHideColumns}
        hasHiddenColumns={hasHiddenColumns}
        showOnlyFillModeColumns={showOnlyFillModeColumns}
      />
    </>
  );
}
