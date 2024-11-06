import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockedCreateContextPage } from './LockedCreateContextPage';
import { UnlockedCreateContextPage } from './UnlockedCreateContextPage';
import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import { useFetchTables } from '../hooks/useFetchTables';
import { Center, Heading, Icon, Spinner } from '@kvib/react';
import { useSubmitContext } from '../hooks/useSubmitContext';
import { FormEvent, useCallback, useState } from 'react';

export const CreateContextPage = () => {
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const locked = search.get('locked') === 'true';

  const teamId = search.get('teamId');
  const name = search.get('name');
  const tableId = search.get('tableId');
  const redirect = search.get('redirect');

  const setTableId = useCallback(
    (newTableId: string) => {
      search.set('tableId', newTableId);
      setSearch(search);
    },
    [search, setSearch]
  );

  const [copyContext, setCopyContext] = useState<string>('');

  const { mutate: submitContext, isPending: isLoading } = useSubmitContext();

  const {
    data: userinfo,
    isPending: isUserinfoLoading,
    isError: isUserinfoError,
  } = useFetchUserinfo();

  const {
    data: tablesData,
    error: tablesError,
    isPending: tablesIsPending,
  } = useFetchTables();

  if (isUserinfoLoading || tablesIsPending) {
    return (
      <Center style={{ height: '100svh' }}>
        <Spinner size="xl" />
      </Center>
    );
  }
  if (isUserinfoError || tablesError) {
    return (
      <Center height="70svh" flexDirection="column" gap="4">
        <Icon icon="error" size={64} weight={600} />
        <Heading size="md">Noe gikk galt, prøv gjerne igjen</Heading>
      </Center>
    );
  }

  const isButtonDisabled = !teamId || !tableId || !name || isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (teamId && name && tableId) {
      submitContext(
        { teamId, tableId, name, copyContext },
        {
          onSuccess: (data) => {
            if (redirect) {
              const incomingRedirect = decodeURIComponent(redirect)
                .replace('{contextId}', data.data.id)
                .replace('{contextName}', data.data.name)
                .replace(
                  '{tableName}',
                  tablesData?.find((table) => table.id === data.data.tableId)
                    ?.name ?? tableId
                );
              const fullRedirect = new URL(incomingRedirect);
              const newRedirect = new URL(
                `${window.location.origin}/context/${data.data.id}`
              );
              fullRedirect.searchParams.set(
                'redirect',
                `${newRedirect.toString()}`
              );
              window.location.href = fullRedirect.toString();
            } else {
              navigate(`/context/${data.data.id}`);
            }
          },
        }
      );
    } else {
      console.error('teamId, tableId, and contextName must be provided');
    }
  };

  return locked ? (
    <LockedCreateContextPage
      userinfo={userinfo}
      tablesData={tablesData}
      handleSumbit={handleSubmit}
      isLoading={isLoading}
      isButtonDisabled={isButtonDisabled}
      setTableId={setTableId}
      name={name}
      teamId={teamId}
      setCopyContext={setCopyContext}
    />
  ) : (
    <UnlockedCreateContextPage
      userinfo={userinfo}
      tablesData={tablesData}
      handleSumbit={handleSubmit}
      isLoading={isLoading}
      isButtonDisabled={isButtonDisabled}
      setTableId={setTableId}
      name={name}
      teamId={teamId}
      setCopyContext={setCopyContext}
    />
  );
};
