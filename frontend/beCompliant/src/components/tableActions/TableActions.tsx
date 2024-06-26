import { Flex } from '@kvib/react';
import { TableFilter, TableFilterProps } from './TableFilter';
import { TableMetaData } from '../../hooks/datafetcher';
import { TableSorter, TableSorterProps } from './TableSorter';

interface TableActionProps {
  tableFilterProps: TableFilterProps;
  tableMetadata: TableMetaData;
  tableSorterProps: TableSorterProps;
}
export const TableActions = (props: TableActionProps) => {
  const { tableFilterProps, tableMetadata, tableSorterProps } = props;

  const { filterOptions, activeFilters, setActiveFilters } = tableFilterProps;

  const { fieldSortedBy, setFieldSortedBy } = tableSorterProps;

  return (
    tableMetadata && (
      <>
        <Flex alignItems="center" justifyContent="space-between">
          <Flex>
            <TableFilter
              filterOptions={filterOptions}
              filterName={'Status'}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
            />

            {tableMetadata?.fields.map((metaColumn) => (
              <TableFilter
                key={metaColumn.id}
                filterName={metaColumn.name}
                filterOptions={metaColumn.options}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
              />
            ))}
          </Flex>
          <Flex>
            <TableSorter
              fieldSortedBy={fieldSortedBy}
              setFieldSortedBy={setFieldSortedBy}
            />
          </Flex>
        </Flex>
      </>
    )
  );
};
