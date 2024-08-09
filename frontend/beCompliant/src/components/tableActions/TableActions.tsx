import { Flex, Heading, Icon } from '@kvib/react';
import { Field } from '../../api/types';
import { TableFilter, TableFilters } from './TableFilter';

interface Props {
  filters: TableFilters;
  optionalFields: Field[];
}

export const TableActions = ({
  filters: tableFilterProps,
  optionalFields,
}: Props) => {
  const { filterOptions, activeFilters, setActiveFilters } = tableFilterProps;
  return (
    <Flex flexDirection="column" gap={'2'} mx={'10'}>
      <Flex gap={'2'} alignItems={'center'}>
        <Icon icon={'filter_list'} />
        <Heading size={'sm'} as={'h4'} fontWeight={'normal'}>
          FILTER
        </Heading>
      </Flex>
      <Flex alignItems="center" gap={'4'} flexWrap={'wrap'}>
        <TableFilter
          filterOptions={filterOptions}
          filterName={'Status'}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />

      {optionalFields?.map((field) => (
          <TableFilter
            key={field.name}
            filterName={field.name}
            filterOptions={field.options}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        ))} 

      </Flex>
    </Flex>
  );
};
