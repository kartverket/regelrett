import { Flex, Heading, Icon } from '@kvib/react';
import { Column } from '../../api/types';
import { TableFilter, TableFilters } from './TableFilter';
import { ActiveFilter } from '../../types/tableTypes';
import { useStoredRedirect } from '../../hooks/useStoredRedirect';

interface Props {
  resetTable: () => void;
  filters: TableFilters;
  tableMetadata: Column[];
  filterByAnswer: boolean;
}

export const TableActions = ({
  resetTable,
  filters: { filterOptions, activeFilters, setActiveFilters },
  tableMetadata,
  filterByAnswer,
}: Props) => {
  const storedRedirect = useStoredRedirect();

  function localSetActiveFilters(activeFilters: ActiveFilter[]) {
    setActiveFilters(activeFilters);
    resetTable();
  }

  return (
    <Flex
      flexDirection="column"
      gap="2"
      paddingX="10"
      py="5"
      position="sticky"
      top={storedRedirect ? '10' : '0'}
      zIndex="1000"
      backgroundColor="gray.50"
      w="100%"
    >
      <Flex gap="2" alignItems="center">
        <Icon icon="filter_list" />
        <Heading size="sm" as="h4" fontWeight="normal">
          FILTER
        </Heading>
      </Flex>
      <Flex alignItems="center" gap="4" flexWrap="wrap">
        <TableFilter
          filterOptions={filterOptions}
          filterName="Status"
          activeFilters={activeFilters}
          setActiveFilters={localSetActiveFilters}
        />

        {tableMetadata
          .filter(({ name }) => filterByAnswer || name !== 'Svar')
          .map((metaColumn) => (
            <TableFilter
              key={metaColumn.name}
              filterName={metaColumn.name}
              filterOptions={metaColumn.options}
              activeFilters={activeFilters}
              setActiveFilters={localSetActiveFilters}
            />
          ))}
      </Flex>
    </Flex>
  );
};
