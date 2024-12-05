import {
  Center,
  Heading,
  Icon,
  Link,
  Spinner,
  StackDivider,
  VStack,
  Text,
  Flex,
  useDisclosure,
  Button,
  IconButton,
} from '@kvib/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Page } from '../components/layout/Page';
import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import { useFetchTeamContexts } from '../hooks/useFetchTeamContexts';
import { useFetchContext } from '../hooks/useFetchContext';
import { useFetchTables } from '../hooks/useFetchTables';
import { DeleteContextModal } from '../components/DeleteContextModal';
import { useDumpCSV } from '../hooks/useDumpCSV';

const FrontPage = () => {
  const {
    data: userinfo,
    isPending: isUserinfoLoading,
    isError: isUserinfoError,
  } = useFetchUserinfo();

  const { mutateAsync: dumpCSV } = useDumpCSV();

  if (isUserinfoLoading) {
    return (
      <Center style={{ height: '100svh' }}>
        <Spinner size="xl" />
      </Center>
    );
  }
  if (isUserinfoError) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size="md">Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  const teams = userinfo ? userinfo.groups : [];

  if (!teams.length) {
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
      const csvData = await dumpCSV();
      const blob = new Blob([csvData], {
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
    }
  };

  return (
    <Page gap="4" alignItems="center">
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
    </Page>
  );
};

function TeamContexts({ teamId }: { teamId: string }) {
  const { data: contexts = [], isPending: contextsIsPending } =
    useFetchTeamContexts(teamId);

  const {
    data: tablesData,
    error: tablesError,
    isPending: tablesIsPending,
  } = useFetchTables();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  if (contextsIsPending || tablesIsPending) {
    return <Spinner size="xl" />;
  }

  const uniqueTableIds = Array.from(
    new Set(contexts?.map((context) => context.tableId))
  );

  const contextTables = tablesData?.filter((table) =>
    uniqueTableIds.includes(table.id)
  );

  return (
    <VStack alignItems="start" marginLeft={8}>
      {contextTables?.map((table) => {
        const contextsForTable = contexts.filter(
          (context) => context.tableId === table.id
        );

        return (
          <VStack alignItems="start" key={table.id}>
            <Text>{table.name}</Text>
            <VStack alignItems="start" pl={4}>
              {contextsForTable.map((context) => (
                <Flex alignItems="center" key={context.id}>
                  <ContextLink key={context.id} contextId={context.id} />
                  <IconButton
                    aria-label="Slett utfylling"
                    colorScheme="red"
                    variant="tertiary"
                    icon="delete"
                    onClick={() => onDeleteOpen()}
                  />
                  <DeleteContextModal
                    onOpen={onDeleteOpen}
                    onClose={onDeleteClose}
                    isOpen={isDeleteOpen}
                    teamId={teamId}
                    contextId={context.id}
                  />
                </Flex>
              ))}
            </VStack>
          </VStack>
        );
      })}
    </VStack>
  );
}

function ContextLink({ contextId }: { contextId: string }) {
  const { data: context, isPending: contextIsPending } =
    useFetchContext(contextId);

  if (contextIsPending) {
    return <Spinner size="sm" />;
  }

  return (
    <Link to={`/context/${contextId}`} as={ReactRouterLink} colorScheme="blue">
      {context?.name}
    </Link>
  );
}

export default FrontPage;
