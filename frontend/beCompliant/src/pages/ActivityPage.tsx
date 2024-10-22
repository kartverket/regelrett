import { Box, Divider, Flex, Heading } from '@kvib/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../components/layout/Page';
import { TableComponent } from '../components/Table';
import { TableStatistics } from '../components/table/TableStatistics';
import { TableActions } from '../components/tableActions/TableActions';
import { useFetchAnswers } from '../hooks/useFetchAnswers';
import { useFetchComments } from '../hooks/useFetchComments';
import { useFetchTable } from '../hooks/useFetchTable';
import { ActiveFilter } from '../types/tableTypes';
import { mapTableDataRecords } from '../utils/mapperUtil';
import { Column, OptionalFieldType } from '../api/types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { filterData } from '../utils/tablePageUtil';
import { useFetchContext } from '../hooks/useFetchContext';
import { useFetchUserinfo } from '../hooks/useFetchUserinfo';

export const ActivityPage = () => {
  const params = useParams();
  const contextId = params.contextId;

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const {
    data: context,
    error: contextError,
    isPending: contextIsPending,
  } = useFetchContext(contextId);

  const {
    data: userinfo,
    error: userinfoError,
    isPending: userinfoIsPending,
  } = useFetchUserinfo();

  const {
    data: tableData,
    error: tableError,
    isPending: tableIsPending,
  } = useFetchTable(context?.tableId);
  const {
    data: comments,
    error: commentError,
    isPending: commentIsPending,
  } = useFetchComments(contextId);
  const {
    data: answers,
    error: answerError,
    isPending: answerIsPending,
  } = useFetchAnswers(contextId);

  const error =
    tableError || commentError || answerError || contextError || userinfoError;

  const isPending =
    tableIsPending ||
    commentIsPending ||
    answerIsPending ||
    contextIsPending ||
    userinfoIsPending;

  const statusFilterOptions: Column = {
    options: [
      { name: 'Utfylt', color: '' },
      { name: 'Ikke utfylt', color: '' },
    ],
    name: 'Status',
    type: OptionalFieldType.OPTION_SINGLE,
  };

  if (isPending) {
    return <LoadingState />;
  }

  if (error || !tableData || !comments || !answers) {
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;
  }

  tableData.records = mapTableDataRecords(tableData, comments, answers);
  const filteredData = filterData(tableData.records, activeFilters);
  const filters = {
    filterOptions: statusFilterOptions.options,
    filterName: '',
    activeFilters: activeFilters,
    setActiveFilters: setActiveFilters,
  };

  return (
    <Page>
      <Flex flexDirection="column" marginX="10" gap="2">
        <Heading lineHeight="1.2">{context?.name}</Heading>
        <TableStatistics filteredData={filteredData} />
      </Flex>
      <Box width="100%" paddingX="10">
        <Divider borderColor="gray.400" />
      </Box>
      <TableActions filters={filters} tableMetadata={tableData.columns} />
      <TableComponent
        contextId={context.id}
        data={filteredData}
        tableData={tableData}
        user={userinfo.user}
      />
    </Page>
  );
};
