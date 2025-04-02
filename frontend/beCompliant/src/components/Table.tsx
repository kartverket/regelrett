/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Column, OptionalField, Question, Form, User } from '../api/types';
import { getSortFuncForColumn } from './table/TableSort';
import { TableActions } from './tableActions/TableActions';
import { useEffect, useState } from 'react';
import { Flex, IconButton, Tooltip } from '@kvib/react';
import { useNavigate, useSearchParams } from 'react-router';
import { DataTableSearch } from './table/DataTableSearch';
import { CSVDownload } from './CSVDownload';

type Props = {
  tableMetadata: Column[];
  filterByAnswer: boolean;
  data: Question[];
  tableData: Form;
  user: User;
  contextId: string;
};

export function TableComponent({
  data,
  tableData,
  contextId,
  user,
  tableMetadata,
  filterByAnswer,
}: Props) {
  const [
    columnVisibility,
    setColumnVisibility,
    unHideColumn,
    unHideColumns,
    showOnlyFillModeColumns,
  ] = useColumnVisibility();

  const navigate = useNavigate();

  const [search] = useSearchParams();
  const filterSearchParams = search.getAll('filter');

  function urlFilterParamsToColumnFilterState(param: string[]) {
    return param.map((para) => {
      const params = para.split('_');

      return { id: params[0], value: params[1] };
    });
  }

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
      filterFn: (row: Row<Question>, columnId: string, filterValue: any) => {
        if (columnId == 'Svar') {
          if (filterValue == '!null')
            return !!row.original.answers?.at(-1)?.answer;
          return filterValue.includes(
            row.original.answers?.at(-1)?.answer ?? 'null'
          );
        }

        const value = (row.getValue(columnId) as OptionalField | null)?.value;

        if (!filterValue) return true; // Hvis ingen filterverdi → vis alt
        if (!value) return false; // Hvis ingen verdi i raden → ikke vis den

        return value.some((val) => filterValue.includes(val));
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
      <DataTableCell
        cell={cell}
        style={{
          width: '1%', // Start as small as possible
          whiteSpace: 'nowrap', // Prevent wrapping
        }}
      >
        <Tooltip content="Se mer">
          <IconButton
            aria-label="se mer"
            icon="info"
            size="md"
            variant="ghost"
            colorPalette="blue"
            onClick={() => navigate(`${row.original.recordId}`)}
          />
        </Tooltip>
      </DataTableCell>
    ),
  };
  columns.unshift(emptyColumn);

  const globalFilterFn: FilterFn<any> = (row, _, filterValue) => {
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
      columnFilters: search.has(`filter`)
        ? urlFilterParamsToColumnFilterState(filterSearchParams)
        : JSON.parse(localStorage.getItem(`filters_${tableData.id}`) || `[]`),
    },
  });

  const headerNames = table.getAllColumns().map((column) => column.id);

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        px="10"
        flexWrap="wrap"
      >
        <>
          <DataTableSearch table={table} />
          <CSVDownload
            rows={
              table
                .getFilteredRowModel()
                .rows.map((row) => row.original) as Question[]
            }
            headerArray={headerNames}
            alignSelf="flex-end"
          />
        </>
      </Flex>
      <TableActions
        tableMetadata={tableMetadata}
        filterByAnswer={filterByAnswer}
        table={table}
        formId={tableData.id}
      />

      <DataTable<RowData>
        table={table}
        unHideColumn={unHideColumn}
        unHideColumns={unHideColumns}
        showOnlyFillModeColumns={showOnlyFillModeColumns}
      />
    </>
  );
}
