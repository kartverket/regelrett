import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import {
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from '@kvib/react';
import { FormEvent, useCallback } from 'react';
import { Table } from '../api/types';
import { CopyContextDropdown } from '../components/createContextPage/CopyContextDropdown';
import { useSearchParams } from 'react-router-dom';

type Props = {
  tablesData: { data: Table[] | undefined; isPending: boolean };
  handleSumbit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isButtonDisabled: boolean;
  setTableId: (newTableId: string) => void;
  name: string | null;
  teamId: string | null;
};

export const LockedCreateContextPage = ({
  tablesData,
  handleSumbit,
  isLoading,
  isButtonDisabled,
  setTableId,
  name,
  teamId,
}: Props) => {
  const {
    data: userinfo,
    isPending: isUserinfoLoading,
    isError: isUserinfoError,
  } = useFetchUserinfo();

  const teamDisplayName = userinfo?.groups.find(
    (group) => group.id === teamId
  )?.displayName;

  const [search, setSearch] = useSearchParams();
  const tableId = search.get('tableId');
  const copyContext = search.get('copyContext');

  const setCopyContext = useCallback(
    (newCopyContext: string) => {
      search.set('copyContext', newCopyContext);
      setSearch(search);
    },
    [search, setSearch]
  );

  if (isUserinfoError) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size="md">Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  return (
    <Stack alignItems="center" justifyContent="center" marginTop="8rem">
      <Stack>
        <Stack gap="16px" mb="2rem">
          <Text fontSize="3xl" fontWeight="bold" mb="1rem">
            Opprett sikkerhetsskjema
          </Text>
          <Text fontSize="sm">
            Velg hvilket sikkerhetsskjema du skal fylle ut for:
          </Text>
          <Flex gap="20px">
            <Stack gap="10px">
              <Text fontSize="sm" fontWeight="bold">
                Funksjon:
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                Team:
              </Text>
            </Stack>
            <Stack gap="10px">
              <Text fontSize="sm">{name}</Text>
              <Skeleton isLoaded={!isUserinfoLoading}>
                <Text fontSize="sm">
                  {teamDisplayName ?? '<Ingen team funnet>'}
                </Text>
              </Skeleton>
            </Stack>
          </Flex>
        </Stack>

        <form onSubmit={handleSumbit}>
          <Stack gap="1rem">
            <FormControl isRequired={true}>
              <FormLabel
                style={{
                  fontSize: 'small',
                  fontWeight: 'bold',
                }}
              >
                Velg sikkerhetsskjema du ønsker å opprette
              </FormLabel>
              <Skeleton isLoaded={!tablesData.isPending}>
                <Select
                  id="tableSelect"
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder="Velg skjema"
                  required
                  w="fit-content"
                  bgColor="white"
                  borderColor="gray.200"
                  value={tableId ?? undefined}
                >
                  {tablesData?.data?.map((table) => (
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
    </Stack>
  );
};
