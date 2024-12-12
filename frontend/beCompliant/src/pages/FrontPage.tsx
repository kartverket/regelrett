import {
  Center,
  Heading,
  Icon,
  Link,
  StackDivider,
  VStack,
  Text,
  Flex,
  useDisclosure,
  Button,
  IconButton,
  useToast,
  Skeleton,
} from '@kvib/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Page } from '../components/layout/Page';
import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import { useFetchTeamContexts } from '../hooks/useFetchTeamContexts';
import { useFetchContext } from '../hooks/useFetchContext';
import { useFetchTables } from '../hooks/useFetchTables';
import { DeleteContextModal } from '../components/DeleteContextModal';
import { apiConfig } from '../api/apiConfig';
import { axiosFetch } from '../api/Fetch';

const FrontPage = () => {
  const {
    data: userinfo,
    isPending: isUserinfoLoading,
    isError: isUserinfoError,
  } = useFetchUserinfo();

  const toast = useToast();

  if (isUserinfoError) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size="md">Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  const teams = userinfo ? userinfo.groups : [];

  if (!isUserinfoLoading && !teams.length) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size="md">
          Vi fant dessverre ingen grupper som tilhører din bruker.
        </Heading>
      </Center>
    );
  }

  const handleExportCSV = async () => {
    try {
      const response = await axiosFetch<Blob>({
        url: apiConfig.dumpCSV.url,
        method: 'GET',
        responseType: 'blob',
      });

      if (!response.data) {
        throw new Error('No data received for CSV');
      }

      const blob = new Blob([response.data], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.csv');

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      const toastId = 'export-csv-error';
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Å nei!',
          description:
            'Det kan være du ikke har tilgang til denne funksjonaliteten:',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Page gap="4" alignItems="center">
      <Skeleton isLoaded={!isUserinfoLoading} fitContent>
        <VStack>
          <Heading textAlign="left" width="100%">
            Dine team
          </Heading>
          <VStack
            align="start"
            divider={<StackDivider />}
            style={{ width: '40ch' }}
          >
            <Button
              padding="0"
              variant="tertiary"
              colorScheme="blue"
              onClick={() => handleExportCSV()}
              rightIcon="download"
            >
              Eksporter skjemautfyllinger
            </Button>
            {teams.map((team) => {
              return (
                <div key={team.id}>
                  <Heading size="md" marginBottom={2}>
                    {team.displayName}
                  </Heading>
                  <TeamContexts teamId={team.id} />
                </div>
              );
            })}
          </VStack>
        </VStack>
      </Skeleton>
    </Page>
  );
};

function TeamContexts({ teamId }: { teamId: string }) {
  const { data: contexts = [], isPending: contextsIsPending } =
    useFetchTeamContexts(teamId);

  const { data: tablesData, isPending: tablesIsPending } = useFetchTables();

  const uniqueTableIds = Array.from(
    new Set(contexts?.map((context) => context.tableId))
  );

  const contextTables = tablesData?.filter((table) =>
    uniqueTableIds.includes(table.id)
  );

  return (
    <VStack alignItems="start" marginLeft={8}>
      <Skeleton isLoaded={!contextsIsPending || !tablesIsPending} fitContent>
        {contextTables?.map((table) => {
          const contextsForTable = contexts.filter(
            (context) => context.tableId === table.id
          );

          return (
            <VStack alignItems="start" key={table.id}>
              <Text>{table.name}</Text>
              <VStack alignItems="start" pl={4}>
                {contextsForTable.map((context) => (
                  <ContextLink key={context.id} contextId={context.id} />
                ))}
              </VStack>
            </VStack>
          );
        })}
      </Skeleton>
    </VStack>
  );
}

function ContextLink({ contextId }: { contextId: string }) {
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const { data: context, isPending: contextIsPending } =
    useFetchContext(contextId);

  return (
    <Flex alignItems="center" key={contextId}>
      <Skeleton isLoaded={!contextIsPending} fitContent>
        <Link
          to={`/context/${contextId}`}
          as={ReactRouterLink}
          colorScheme="blue"
        >
          {context?.name}
        </Link>
        <IconButton
          aria-label="Slett utfylling"
          colorScheme="red"
          variant="tertiary"
          icon="delete"
          onClick={() => onDeleteOpen()}
        />
      </Skeleton>
      <DeleteContextModal
        onOpen={onDeleteOpen}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        teamId={context?.teamId ?? ''}
        contextId={contextId}
      />
    </Flex>
  );
}

export default FrontPage;
