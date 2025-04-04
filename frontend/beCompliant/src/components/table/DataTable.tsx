import {
  Button,
  Flex,
  Heading,
  Text,
  KvibTable,
  TagLabel,
  Separator,
  TagRoot,
  TagEndElement,
  TagCloseTrigger,
  Switch,
} from '@kvib/react';
import { Table as TanstackTable, flexRender } from '@tanstack/react-table';
import React from 'react';
import { PaginationButtonContainer } from './pagination/PaginationButtonContainer';
import { TableStateProvider } from './TableState';

interface Props<TData> {
  table: TanstackTable<TData>;
  unHideColumn: (name: string) => void;
  unHideColumns: (name: string[]) => void;
  showOnlyFillModeColumns: (name: string[]) => void;
}

export function DataTable<TData>({
  table,
  unHideColumn,
  unHideColumns,
  showOnlyFillModeColumns,
}: Props<TData>) {
  const headerNames = table.getAllColumns().map((column) => column.id);

  return (
    <TableStateProvider>
      <Flex flexDirection="column" width="100%" gap="4">
        <Flex
          justifyContent={
            table.getIsAllColumnsVisible() ? 'flex-end' : 'space-between'
          }
          alignItems="end"
          width="100%"
          px="10"
        >
          {!table.getIsAllColumnsVisible() && (
            <Flex direction="column" gap="2">
              <Heading size="xs" fontWeight="semibold">
                Skjulte kolonner
              </Heading>
              <Flex gap="1" alignItems="center" flexWrap="wrap">
                <Button
                  aria-label={'Show all columns'}
                  onClick={() => {
                    unHideColumns(headerNames);
                  }}
                  colorPalette="blue"
                  size="2xs"
                >
                  <Text textStyle="xs" colorScheme="blue">
                    Vis alle kolonner
                  </Text>
                </Button>
                <Separator height="5" orientation="vertical" />

                {table.getAllLeafColumns().map(
                  (column) =>
                    !column.getIsVisible() && (
                      <TagRoot
                        colorPalette="blue"
                        variant="subtle"
                        size="md"
                        key={column.id}
                        onClick={() => {
                          unHideColumn(column.id);
                        }}
                        cursor="pointer"
                      >
                        <TagLabel>{column.id}</TagLabel>
                        <TagEndElement>
                          <TagCloseTrigger cursor="pointer" />
                        </TagEndElement>
                      </TagRoot>
                    )
                )}
              </Flex>
            </Flex>
          )}
          <Flex alignItems="center" flexDirection="row">
            <Text fontWeight="bold" marginRight="15px" w="130px">
              Vis alle kolonner
            </Text>
            <Switch
              onCheckedChange={(e) =>
                e.checked
                  ? unHideColumns(headerNames)
                  : showOnlyFillModeColumns(headerNames)
              }
              colorPalette="blue"
              checked={table.getIsAllColumnsVisible()}
            />
          </Flex>
        </Flex>
        <KvibTable.Root
          variant="line"
          striped
          backgroundColor="white"
          paddingX="3"
        >
          <KvibTable.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <KvibTable.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) =>
                  flexRender(header.column.columnDef.header, {
                    key: header.id,
                    ...header.getContext(),
                  })
                )}
              </KvibTable.Row>
            ))}
          </KvibTable.Header>
          <KvibTable.Body>
            {table.getRowModel().rows.map((row) => (
              <KvibTable.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <React.Fragment key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </React.Fragment>
                ))}
              </KvibTable.Row>
            ))}
          </KvibTable.Body>
        </KvibTable.Root>
        <PaginationButtonContainer table={table} />
      </Flex>
    </TableStateProvider>
  );
}
