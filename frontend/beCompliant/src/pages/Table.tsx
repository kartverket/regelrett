import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Center,
  Spinner,
  useMediaQuery,
  Heading,
  Button,
} from '@kvib/react';
import { useState, useEffect } from 'react';
import { useAnswersFetcher } from '../hooks/answersFetcher';
import { QuestionRow } from '../components/questionRow/QuestionRow';
import { AnswerType } from '../components/answer/Answer';
import { sortData } from '../utils/sorter';
import {
  Field,
  Option,
  TableMetaData,
  useMetodeverkFetcher,
} from '../hooks/datafetcher';
import { useParams } from 'react-router-dom';

import { TableActions } from '../components/tableActions/TableActions';

import MobileTableView from '../components/MobileTableView';
import { TableStatistics } from '../components/tableStatistics/TableStatistics';

export type Fields = {
  Kortnavn: string;
  Pri: string;
  Løpenummer: number;
  Ledetid: string;
  Aktivitet: string;
  Område: string;
  Hvem: string[];
  Kode: string;
  ID: string;
  question: string;
  updated: string;
  Svar: string;
  actor: string;
  Status: string;
};

export type RecordType = Record<string, Fields>;

export type ActiveFilter = {
  filterName: string;
  filterValue: string;
};

export const MainTableComponent = () => {
  const params = useParams();
  const team = params.teamName;

  const [fetchNewAnswers, setFetchNewAnswers] = useState(true);
  const { answers, loading: answersLoading } = useAnswersFetcher(
    fetchNewAnswers,
    setFetchNewAnswers,
    team
  );
  const {
    data,
    dataError,
    choices,
    tableMetaData,
    loading: metodeverkLoading,
  } = useMetodeverkFetcher(team);
  const [columns, setColumns] = useState<Field[] | undefined>(
    tableMetaData?.fields
  );

  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);

  useEffect(() => {
    setColumns(tableMetaData?.fields);
  }, [tableMetaData]);

  const [fieldSortedBy, setFieldSortedBy] = useState<keyof Fields>(
    '' as keyof Fields
  );

  const [combinedData, setCombinedData] = useState<RecordType[]>([]);
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
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filteredData, setFilteredData] = useState<RecordType[]>([]);

  const [isLargerThan800] = useMediaQuery('(min-width: 800px)');

  const updateToCombinedData = (
    answers: AnswerType[],
    data: RecordType[]
  ): RecordType[] => {
    return data.map((item: RecordType) => {
      const match = answers?.find(
        (answer: AnswerType) => answer.questionId === item.fields.ID
      );
      const combinedData = {
        ...item,
        fields: {
          ...item.fields,
          ...match,
          Status: match?.Svar ? 'Utfylt' : 'Ikke utfylt',
        },
      };
      return combinedData;
    });
  };

  useEffect(() => {
    const updatedData = updateToCombinedData(answers!, data);
    setCombinedData(updatedData);
  }, [answers, data]);

  useEffect(() => {
    const sortedData = sortData(combinedData ?? [], fieldSortedBy);
    setCombinedData(sortedData);
  }, [fieldSortedBy]);

  const filterData = (
    data: RecordType[],
    filters: ActiveFilter[]
  ): RecordType[] => {
    if (!filters.length || !data.length) return data;

    return filters.reduce((filteredData, filter) => {
      const fieldName = filter.filterName as keyof Fields;

      if (!fieldName || !(fieldName in data[0].fields)) {
        console.error(`Invalid filter field name: ${filter.filterName}`);
        return filteredData;
      }

      return filteredData.filter((record: RecordType) => {
        const recordField = record.fields[fieldName];
        if (typeof recordField === 'string')
          return recordField === filter.filterValue;
        if (typeof recordField === 'number')
          return recordField.toString() === filter.filterValue;
        if (Array.isArray(recordField))
          return recordField.includes(filter.filterValue);
        return false;
      });
    }, data);
  };

  useEffect(() => {
    const filteredData = filterData(combinedData, activeFilters);
    setFilteredData(filteredData);
  }, [activeFilters, combinedData, fieldSortedBy]);

  if ((!answers && answersLoading) || metodeverkLoading) {
    return (
      <Center style={{ height: '100svh' }}>
        <Spinner size="xl" />
      </Center>
    );
  }

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

  if (isLargerThan800) {
    return (
      <>
        {dataError ? (
          <div>{dataError}</div> // Display error if there is any
        ) : filteredData && tableMetaData ? (
          <>
            <Heading style={{ margin: 20 }}>{team}</Heading>
            <TableStatistics filteredData={filteredData} />
            <TableActions
              tableFilterProps={tableFilterProps}
              tableMetadata={tableMetaData}
              tableSorterProps={tableSorterProps}
            />
            <TableContainer>
              <Table
                variant="striped"
                colorScheme="gray"
                style={{ tableLayout: 'auto' }}
              >
                <Thead>
                  <Tr>
                    <Th>Når</Th>
                    {columns?.map((field, index) => {
                      if (!hiddenIndices.includes(index)) {
                        return (
                          <Th key={field.id}>
                            {field.name}{' '}
                            <Button
                              variant="tertiary"
                              size="xs"
                              onClick={(e) => {
                                setHiddenIndices((prev) => [...prev, index]);
                              }}
                            >
                              X
                            </Button>
                          </Th>
                        );
                      }
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredData.map((item: RecordType) => (
                    <QuestionRow
                      key={item.fields.ID}
                      record={item}
                      choices={choices}
                      setFetchNewAnswers={setFetchNewAnswers}
                      tableColumns={tableMetaData.fields}
                      team={team}
                      hiddenIndices={hiddenIndices}
                    />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </>
        ) : (
          'No data to display...'
        )}
      </>
    );
  }

  return (
    <>
      <Heading style={{ margin: 20 }}>{team}</Heading>
      <TableStatistics filteredData={filteredData} />
      <MobileTableView
        filteredData={filteredData}
        choices={choices}
        setFetchNewAnswers={setFetchNewAnswers}
        team={team}
        tableFilterProps={tableFilterProps}
        tableMetadata={tableMetaData}
      />
    </>
  );
};
