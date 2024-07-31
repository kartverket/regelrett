import {
  Center,
  Flex,
  Heading,
  Icon,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  useMediaQuery,
} from '@kvib/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MobileTableView from '../components/MobileTableView';
import { TableComponent } from '../components/Table';
import { TableActions } from '../components/tableActions/TableActions';
import { TableStatistics } from '../components/tableStatistics/TableStatistics';
import { useFetchAnswers } from '../hooks/useFetchAnswers';
import { useFetchComments } from '../hooks/useFetchComments';
import { useFetchMetodeverk } from '../hooks/useFetchMetodeverk';
import { useLocalstorageState } from '../hooks/useLocalstorageState';
import { ActiveFilter, Fields, Option } from '../types/tableTypes';
import { sortData } from '../utils/sorter';
import { filterData, updateToCombinedData } from '../utils/tablePageUtil';

export const MainTableComponent = () => {
  const params = useParams();
  const team = params.teamName;
  const schemaId = params.schemaid;

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [columnVisibility, setColumnVisibility] = useLocalstorageState<
    Record<string, boolean>
  >('columnVisibility', {});

  const [fieldSortedBy, setFieldSortedBy] = useState<keyof Fields>(
    '' as keyof Fields
  );

  const {
    data: metodeverkData,
    isPending: isMetodeverkLoading,
    isError: isMetodeverkError,
  } = useFetchMetodeverk();

  const {
    data: answers,
    isPending: isAnswersLoading,
    isError: isAnswersError,
  } = useFetchAnswers(team);

  const { data: comments } = useFetchComments(team);

  const statusFilterOptions: Option = {
    choices: [
      { name: 'Utfylt', id: '', color: '' },
      {
        name: 'Ikke utfylt',
        id: '',
        color: '',
      },
    ],
    inverseLinkFieldId: '',
    isReversed: false,
    linkedTableId: '',
    prefersSingleRecordLink: false,
  };

  const unhideColumn = (name: string) => {
    setColumnVisibility((prev: Record<string, boolean>) => ({
      ...prev,
      [name]: true,
    }));
  };

  const [isSmallerThan800] = useMediaQuery('(max-width: 800px)');

  if (isAnswersLoading || isMetodeverkLoading) {
    return (
      <Center style={{ height: '100svh' }}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isMetodeverkError || isAnswersError) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size={'md'}>Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  const { records, tableMetaData, choices } = metodeverkData;

  const updatedData = updateToCombinedData(answers, records, comments);

  const filteredData = filterData(updatedData, activeFilters);
  const sortedData = sortData(filteredData, fieldSortedBy);

  const tableFilterProps = {
    filterOptions: statusFilterOptions,
    filterName: '',
    activeFilters: activeFilters,
    setActiveFilters: setActiveFilters,
  };

  const tableSorterProps = {
    fieldSortedBy: fieldSortedBy,
    setFieldSortedBy: setFieldSortedBy,
  };

  if (updatedData.length === 0) {
    return (
      <Heading size={'md'} m={8}>
        {'No data to display...'}
      </Heading>
    );
  }

  if (isSmallerThan800) {
    return (
      <>
        <Heading style={{ margin: 20 }}>{team}</Heading>
        <TableStatistics filteredData={filteredData} />
        <MobileTableView
          filteredData={sortedData}
          choices={choices}
          team={team}
          tableFilterProps={tableFilterProps}
          tableMetadata={tableMetaData}
        />
      </>
    );
  }

  const hasHiddenColumns = Object.values(columnVisibility).some(
    (value) => value === false
  );

  return (
    <>
      <Heading style={{ margin: 20 }}>{team}</Heading>
      <TableStatistics filteredData={filteredData} />
      <TableActions
        tableFilterProps={tableFilterProps}
        tableMetadata={tableMetaData}
        tableSorterProps={tableSorterProps}
      />
      {hasHiddenColumns && (
        <Flex direction="column" gap="8px" margin="20px">
          <Heading size="xs">Skjulte kolonner</Heading>
          <Flex gap="4px">
            {Object.entries(columnVisibility)
              .filter(([_, visible]) => !visible)
              .map(([name, _]) => (
                <Tag key={name}>
                  <TagLabel>{name}</TagLabel>
                  <TagCloseButton onClick={() => unhideColumn(name)} />
                </Tag>
              ))}
          </Flex>
        </Flex>
      )}
      <TableComponent
        data={sortedData}
        fields={tableMetaData.fields}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </>
  );
};
