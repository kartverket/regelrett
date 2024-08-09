import { Flex, Select, Text } from '@kvib/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ActiveFilter } from '../../api/types';

export type TableFilters = {
  filterName: string;
  filterOptions: string[] | null;
  activeFilters: ActiveFilter[];
  setActiveFilters: Dispatch<SetStateAction<ActiveFilter[]>>;
};

export const TableFilter = ({
  filterName,
  filterOptions,
  activeFilters,
  setActiveFilters,
}: TableFilters) => {
  const placeholder = 'Alle';
  const activeFilterValue = activeFilters.find(
    (filter) => filter.filterName === filterName
  )?.filterValue;

  const [currentValue, setCurrentValue] = useState<string | undefined>(
    activeFilterValue
  );

  useEffect(() => {
    setCurrentValue(activeFilterValue ?? placeholder);
  }, [activeFilters]);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const filterValue = filterOptions?.find(
      (choice) => choice === event.target.value
    );
    setCurrentValue(filterValue);

    const updatedFilters = activeFilters.filter(
      (filter) => filter.filterName !== filterName
    );

    if (filterValue) {
      updatedFilters.push({
        filterName: filterName,
        filterValue: filterValue,
      });
    }

    setActiveFilters(updatedFilters);
  };

  return (
    filterOptions && (
      <Flex flexDirection={'column'} gap={'1'}>
        <Text size={'md'} as={'b'} color={'blue.500'}>
          {filterName}
        </Text>
        <Select
          aria-label="select"
          placeholder={placeholder}
          onChange={handleFilterChange}
          value={currentValue}
          bg={'white'}
          w={'210px'}
          maxW={'210px'}
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {filterOptions.map((choice) => (
            <option value={choice} key={choice}>
              {choice}
            </option>
          ))}
        </Select>
      </Flex>
    )
  );
};
