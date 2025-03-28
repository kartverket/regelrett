import {
  Box,
  Flex,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Text,
} from '@kvib/react';
import { useParams, useSearchParams } from 'react-router';
import { Page } from '../components/layout/Page';
import { TableComponent } from '../components/Table';
import { TableStatistics } from '../components/table/TableStatistics';
import { useAnswers } from '../hooks/useAnswers';
import { useComments } from '../hooks/useComments';
import { useForm } from '../hooks/useForm';
import { ActiveFilter } from '../types/tableTypes';
import { mapTableDataRecords } from '../utils/mapperUtil';
import { AnswerType, Column, OptionalFieldType } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { filterData } from '../utils/tablePageUtil';
import { useContext } from '../hooks/useContext';
import { useUser } from '../hooks/useUser';
import { useLocalstorageState } from '../hooks/useStorageState';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SettingsModal } from '../components/table/SettingsModal';
import RedirectBackButton from '../components/RedirectBackButton';
import { useQueryClient } from '@tanstack/react-query';

export default function ActivityPage() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterSearchParams = searchParams.get('filters');
  const contextId = params.contextId;
  const queryClient = useQueryClient();

  const [activeFilters, setActiveFilters] = useLocalstorageState<
    Record<string, ActiveFilter[]>
  >('filters', {});

  const filterOverrideRef = useRef(false);

  const setFilters = useCallback(
    (newFilters: ActiveFilter[] | null) => {
      setSearchParams(
        (current) => {
          if (newFilters == null) {
            current.delete('filters');
          } else {
            current.set('filters', JSON.stringify(newFilters));
          }
          return current;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const {
    data: context,
    error: contextError,
    isPending: contextIsPending,
  } = useContext(contextId);

  const {
    data: userinfo,
    error: userinfoError,
    isPending: userinfoIsPending,
  } = useUser();

  const {
    data: tableData,
    error: tableError,
    isPending: tableIsPending,
  } = useForm(context?.formId);
  const {
    data: comments,
    error: commentError,
    isPending: commentIsPending,
  } = useComments(contextId);

  const {
    data: answers,
    error: answerError,
    isPending: answerIsPending,
  } = useAnswers(contextId);

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!tableData?.id) return;

    setActiveFilters((prev) => {
      if (!filterSearchParams) {
        if (prev[tableData.id]?.length > 0) {
          setFilters(prev[tableData.id]);
        }
        return prev;
      } else {
        const parsedFilters: ActiveFilter[] = JSON.parse(filterSearchParams);
        filterOverrideRef.current = true;
        return {
          ...prev,
          [tableData.id]: parsedFilters,
        };
      }
    });
  }, [filterSearchParams, setActiveFilters, setFilters, tableData?.id]);

  useEffect(() => {
    if (!tableData?.id) return;

    if (filterOverrideRef.current) {
      filterOverrideRef.current = false;
      return;
    }

    setActiveFilters((prev) => {
      if (prev[tableData.id]?.length > 0) {
        const value = prev[tableData.id].filter((filterObject) =>
          tableData.columns.some(
            (column) => column.name === filterObject.filterName
          )
        );
        setFilters(value);
        return {
          ...prev,
          [tableData.id]: value,
        };
      } else {
        setFilters(null);
        return prev;
      }
    });
  }, [tableData?.id, setFilters, tableData?.columns, setActiveFilters]);

  useEffect(() => {
    return () => {
      setSearchParams(
        (current) => {
          current.delete('filters');
          return current;
        },
        { replace: true }
      );
    };
  }, [setSearchParams]);

  const error =
    tableError || commentError || answerError || contextError || userinfoError;

  const statusFilterOptions: Column = {
    options: [
      { name: 'Utfylt', color: '' },
      { name: 'Ikke utfylt', color: '' },
    ],
    name: 'Status',
    type: OptionalFieldType.OPTION_SINGLE,
  };

  if (contextError) {
    const statusCode = contextError.response?.status;
    if (statusCode === 401) {
      return (
        <ErrorState message="Du har ikke tilgang til denne skjemautfyllingen" />
      );
    } else if (statusCode === 404) {
      return (
        <ErrorState message="Denne skjemautfyllingen finnes ikke. Kanskje den er slettet?" />
      );
    }
  } else if (error) {
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;
  }

  if (tableData && comments && answers) {
    tableData.records = mapTableDataRecords(tableData, comments, answers);
  }
  const filteredData = tableData
    ? filterData(tableData.records, activeFilters[tableData.id] ?? [])
    : [];
  const filters = {
    filterOptions: statusFilterOptions.options,
    filterName: '',
    activeFilters: tableData ? (activeFilters[tableData.id] ?? []) : [],
    setActiveFilters: (activeFilters: ActiveFilter[]) =>
      tableData &&
      setActiveFilters((prev) => ({ ...prev, [tableData.id]: activeFilters })),
  };

  const allSingleSelect = tableData?.records.every(
    (record) =>
      record.metadata?.answerMetadata?.type === AnswerType.SELECT_SINGLE
  );

  const teamName = userinfo?.groups.find(
    (team) => team.id === context?.teamId
  )?.displayName;

  return (
    <>
      <RedirectBackButton />
      <Page>
        <Flex flexDirection="column" maxW="100%" alignSelf="center" gap="8">
          <Flex flexDirection="column" gap="2" px="10">
            <Skeleton loading={contextIsPending || tableIsPending}>
              <Flex justifyContent="space-between">
                <Heading
                  size="4xl"
                  fontWeight="bold"
                >{`${context?.name} - ${tableData?.name}`}</Heading>
                <IconButton
                  variant="ghost"
                  icon="settings"
                  size="lg"
                  aria-label="Edit context"
                  colorPalette="blue"
                  onClick={() => setSettingsOpen(true)}
                />
              </Flex>
            </Skeleton>
            <Skeleton loading={contextIsPending || userinfoIsPending}>
              <Text fontSize="xl" fontWeight="600" pb="7">
                Team: {teamName}{' '}
              </Text>
            </Skeleton>
            <Skeleton
              loading={tableIsPending || answerIsPending || commentIsPending}
            >
              <TableStatistics filteredData={filteredData} />
            </Skeleton>
          </Flex>
          <Box width="100%" paddingX="10">
            <Separator borderColor="gray.400" />
          </Box>
          <Skeleton
            loading={
              tableIsPending ||
              userinfoIsPending ||
              contextIsPending ||
              answerIsPending ||
              commentIsPending
            }
            minH="100vh"
            minW="60vw"
            w="auto"
          >
            {!!tableData &&
              !!context &&
              !!userinfo &&
              !!comments &&
              !!answers && (
                <TableComponent
                  filters={filters}
                  tableMetadata={tableData?.columns ?? []}
                  filterByAnswer={allSingleSelect ?? false}
                  contextId={context?.id}
                  data={filteredData}
                  tableData={tableData}
                  user={userinfo.user}
                />
              )}
          </Skeleton>
          <SettingsModal
            setOpen={setSettingsOpen}
            open={settingsOpen}
            currentTeamName={teamName}
            onCopySuccess={() => queryClient.invalidateQueries()}
          />
        </Flex>
      </Page>
    </>
  );
}
