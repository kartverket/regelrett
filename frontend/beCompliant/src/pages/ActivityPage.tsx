import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Icon,
  Spinner,
} from '@kvib/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TableComponent } from '../components/Table';
import { Page } from '../components/layout/Page';
import { TableStatistics } from '../components/table/TableStatistics';

import { ActiveFilter, Field, OptionalFieldType } from '../api/types';
import { TableActions } from '../components/tableActions/TableActions';
import { useFetchTable } from '../hooks/useFetchTable';
import { filterData } from '../utils/tablePageUtil';

export const ActivityPage = () => {
  const params = useParams();
  const team = params.teamName;
  const tableId = params.tableId;

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const { data, error, isFetching } = useFetchTable(tableId, team);

  if (!data) {
    return undefined;
  }

  if (isFetching) {
    return (
      <Center style={{ height: '100svh' }}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size={'md'}>Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  const statusFilterOptions: Field = {
    options: ['Utfylt', 'Ikke utfylt'],
    name: 'Status',
    type: OptionalFieldType.OPTION_SINGLE,
  };

  const filteredData = filterData(data.records, activeFilters);

  const filters = {
    filterOptions: statusFilterOptions.options,
    filterName: statusFilterOptions.name,
    activeFilters: activeFilters,
    setActiveFilters: setActiveFilters,
  };

  return (
    <Page>
      <Flex flexDirection={'column'} mx={'10'} gap={'2'}>
        <Heading lineHeight={'1.2'}>{team}</Heading>
        <TableStatistics filteredData={filteredData} />
      </Flex>
      <Box w="100%" px={'10'}>
        <Divider borderColor={'gray.400'} />
      </Box>

      <TableActions filters={filters} optionalFields={data.fields} />
      <TableComponent data={filteredData} fields={data.fields} />
    </Page>
  );
};
