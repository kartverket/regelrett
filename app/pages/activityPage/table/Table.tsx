/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CellContext,
  ColumnDef,
  FilterFn,
  Row,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useColumnVisibility } from "../../../hooks/useColumnVisibility";
import { Comment } from "./Comment";
import { DataTable } from "./DataTable";
import { DataTableCell } from "./DataTableCell";
import { DataTableHeader } from "./DataTableHeader";
import { TableCell } from "./TableCell";
import type {
  Column,
  OptionalField,
  Question,
  Form,
  User,
} from "../../../api/types";
import { getSortFuncForColumn } from "./TableSort";
import { TableActions } from "./TableActions";
import { useSearchParams } from "react-router";
import { DataTableSearch } from "./DataTableSearch";
import { CSVDownload } from "./csvDownload/CSVDownload";
import { ColumnActions } from "@/pages/activityPage/table/ColumnActions";
import { cn } from "@/lib/utils";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { TableStatistics } from "../TableStatistics";
import { useLocalstorageState } from "@/hooks/useStorageState";

type Props = {
  tableMetadata: Column[];
  filterByAnswer: boolean;
  data: Question[];
  tableData: Form;
  user: User;
  contextId: string;
  isLoading: boolean;
};

export function TableComponent({
  data,
  tableData,
  contextId,
  user,
  tableMetadata,
  filterByAnswer,
  isLoading,
}: Props) {
  const [
    columnVisibility,
    setColumnVisibility,
    unHideColumn,
    unHideColumns,
    showOnlyFillModeColumns,
  ] = useColumnVisibility();

  const [search] = useSearchParams();
  const filterSearchParams = search.getAll("filter");
  const pageParam = search.get("page");
  const pageIndex = pageParam ? parseInt(pageParam) - 1 : 0;

  function urlFilterParamsToColumnFilterState(params: string[]) {
    const grouped: Record<string, string[]> = {};

    for (const param of params) {
      const [id, ...rest] = param.split("_");
      const value = rest.join("_");
      grouped[id] = [...(grouped[id] ?? []), value];
    }

    return Object.entries(grouped).map(([id, value]) => ({ id, value }));
  }

  const [sorting, setSorting] = useLocalstorageState<SortingState>(
    `sortingState_${tableData.id}`,
    [],
  );

  const columns: ColumnDef<any, any>[] = tableData.columns.map(
    (field, index) => ({
      header: ({ column }) => (
        <DataTableHeader
          column={column}
          header={field.name}
          setColumnVisibility={setColumnVisibility}
          className={cn(
            field.name.toLowerCase() === "id" ? "min-w-[120px]" : undefined,
            field.name.toLowerCase() === "svar" ? "min-w-[220px]" : undefined,
          )}
        />
      ),
      id: field.name,
      accessorFn: (row: Question) => {
        if (row.metadata.optionalFields) {
          return row.metadata.optionalFields.find(
            (col) => col.key === field.name,
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
        if (columnId === "Svar") {
          return getLastUpdatedTime(a) - getLastUpdatedTime(b);
        }

        const getValue = (row: Row<Question>) => {
          return (
            (
              row.getValue(columnId) as OptionalField | null
            )?.value?.[0]?.toLowerCase() || ""
          );
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

        const sortFunc = getSortFuncForColumn(columnId);
        return sortFunc(valueA, valueB);
      },
      filterFn: (row: Row<Question>, columnId: string, filterValue: string) => {
        if (columnId == "Svar") {
          return filterValue.includes(
            row.original.answers?.at(-1)?.answer ?? "",
          );
        }

        const value = (row.getValue(columnId) as OptionalField | null)?.value;

        if (!filterValue) return true; // Hvis ingen filterverdi → vis alt
        if (!value) return false; // Hvis ingen verdi i raden → ikke vis den

        return value.some((val) => filterValue.includes(val));
      },
    }),
  );

  const statusColumn: ColumnDef<any, any> = {
    id: "Status",
    accessorFn: (row) => {
      const answer = row.answers?.at(-1)?.answer;
      return answer ? "utfylt" : "ikke utfylt";
    },
    filterFn: (row, _, filterValue: string[]) => {
      const latestAnswer = row.original.answers?.at(-1)?.answer;
      const status = latestAnswer ? "utfylt" : "ikke utfylt";
      return filterValue.includes(status);
    },
    enableColumnFilter: true,
    header: () => null, // don't show header
    cell: () => null, // don't show cell
  };

  const commentColumn: ColumnDef<any, any> = {
    header: ({ column }) => {
      return (
        <DataTableHeader
          column={column}
          header={"Kommentar"}
          setColumnVisibility={setColumnVisibility}
        />
      );
    },
    id: "Kommentar",
    accessorFn: (row: Question) => row.comments.at(-1)?.comment ?? "",
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
  const svarIndex = columns.findIndex((column) => column.id === "Svar");

  // If the column is found, inject the new columns
  if (svarIndex !== -1) {
    columns.splice(svarIndex + 1, 0, statusColumn);
    columns.splice(svarIndex + 1, 0, commentColumn);
  } else {
    // If not found, push it at the end (or handle it differently as needed)
    columns.push(statusColumn, commentColumn);
  }

  const globalFilterFn: FilterFn<any> = (row, _, filterValue) => {
    const searchTerm = String(filterValue).toLowerCase();

    const optionalFields = row.original.metadata?.optionalFields;

    const getFieldValue = (index: number): string => {
      return optionalFields[index]?.value[0]?.toLowerCase() || "";
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
      pagination: {
        pageIndex: pageIndex,
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    autoResetAll: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalFilterFn,
    initialState: {
      columnFilters: search.has(`filter`)
        ? urlFilterParamsToColumnFilterState(filterSearchParams)
        : JSON.parse(localStorage.getItem(`filters_${tableData.id}`) || `[]`),
    },
  });

  const headerNames = table.getAllColumns().map((column) => column.id);

  return (
    <>
      <div className="px-10 flex justify-between">
        <SkeletonLoader loading={isLoading} width="w-full" height="h-6">
          <TableStatistics
            filteredData={tableData?.records ?? []}
            table={table}
          />
        </SkeletonLoader>
        <CSVDownload
          rows={
            table
              .getFilteredRowModel()
              .rows.map((row) => row.original) as Question[]
          }
          headerArray={headerNames}
        />
      </div>
      <TableActions
        tableMetadata={tableMetadata}
        filterByAnswer={filterByAnswer}
        table={table}
        formId={tableData.id}
      />
      <div className="flex px-10 gap-4 items-center">
        <ColumnActions
          table={table}
          unHideColumn={unHideColumn}
          unHideColumns={unHideColumns}
          showOnlyFillModeColumns={showOnlyFillModeColumns}
        />
        <div className="flex justify-between items-center flex-wrap">
          <DataTableSearch table={table} />
        </div>
      </div>
      <DataTable<RowData> table={table} />
    </>
  );
}
