import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import { CopyContextDropdown } from '../components/createContextPage/CopyContextDropdown';
import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from '@kvib/react';
import { useSearchParams } from 'react-router-dom';
import { FormEvent, useCallback, useEffect } from 'react';
import { Table } from '../api/types';

type Props = {
  tablesData: { data: Table[] | undefined; isPending: boolean };
  handleSumbit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isButtonDisabled: boolean;
  setTableId: (newTableId: string) => void;
  name: string | null;
  teamId: string | null;
};

export const UnlockedCreateContextPage = ({
  tablesData,
  handleSumbit,
  isLoading,
  isButtonDisabled,
  setTableId,
  name,
  teamId,
}: Props) => {
  const [search, setSearch] = useSearchParams();
  const tableId = search.get('tableId');
  const copyContext = search.get('copyContext');

  const {
    data: userinfo,
    isPending: isUserinfoLoading,
    isError: isUserinfoError,
  } = useFetchUserinfo();

  const setTeamId = useCallback(
    (newTeamId: string) => {
      search.set('teamId', newTeamId);
      setSearch(search);
    },
    [search, setSearch]
  );

  const setName = useCallback(
    (newName: string) => {
      search.set('name', newName);
      setSearch(search);
    },
    [search, setSearch]
  );

  const setCopyContext = useCallback(
    (newCopyContext: string) => {
      search.set('copyContext', newCopyContext);
      setSearch(search);
    },
    [search, setSearch]
  );

  // Effect to set default values
  useEffect(() => {
    if (teamId == null) {
      if (userinfo?.groups && userinfo.groups.length > 0) {
        setTeamId(userinfo.groups[0].id);
      }
    }

    if (name == null) {
      setName('');
    }

    if (tableId == null) {
      if (tablesData.data && tablesData.data.length > 0) {
        setTableId(tablesData.data[0].id);
      }
    }
  }, [
    userinfo,
    teamId,
    name,
    tableId,
    tablesData,
    setTeamId,
    setName,
    setTableId,
  ]);

  if (isUserinfoError) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size="md">Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      marginTop="8rem"
    >
      <form onSubmit={handleSumbit}>
        <Text fontSize="3xl" fontWeight="bold" mb="32px">
          Opprett sikkerhetsskjema
        </Text>
        <Stack gap="16px">
          <FormControl>
            <FormLabel htmlFor="select">Velg team</FormLabel>
            <Skeleton isLoaded={!isUserinfoLoading}>
              <Select
                id="select"
                placeholder="Velg team"
                onChange={(e) => setTeamId(e.target.value)}
                required
                bgColor="white"
                borderColor="gray.200"
                value={teamId ?? undefined}
              >
                {userinfo?.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.displayName}
                  </option>
                ))}
              </Select>
            </Skeleton>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="tableSelect">Velg sikkerhetsskjema</FormLabel>
            <Skeleton isLoaded={!tablesData.isPending}>
              <Select
                id="tableSelect"
                placeholder="Velg skjema"
                required
                bgColor="white"
                borderColor="gray.200"
                onChange={(e) => setTableId(e.target.value)}
                value={tableId ?? undefined}
              >
                {tablesData.data?.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </Select>
            </Skeleton>
          </FormControl>
          {tableId && tableId.trim() && teamId && teamId.trim() && (
            <CopyContextDropdown
              tableId={tableId}
              copyContext={copyContext}
              setCopyContext={setCopyContext}
            />
          )}
          <FormControl>
            <FormLabel htmlFor="contextName">Navn på skjemautfylling</FormLabel>
            <Input
              id="contextName"
              type="text"
              placeholder="Skriv inn navn på skjemautfylling"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value)}
              required
              bgColor="white"
              borderColor="gray.200"
            />
          </FormControl>
          <Button
            type="submit"
            variant="primary"
            colorScheme="blue"
            disabled={isButtonDisabled}
          >
            {isLoading ? <Spinner size="sm" /> : 'Opprett skjema'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
