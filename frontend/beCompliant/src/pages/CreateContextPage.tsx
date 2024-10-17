import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Select,
  Spinner,
  Stack,
} from '@kvib/react';
import { Form, useNavigate } from 'react-router-dom';
import {
  SubmitContextResponse,
  useSubmitContext,
} from '../hooks/useSubmitContext';
import { FormEvent, useEffect, useState } from 'react';
import { useFetchTables } from '../hooks/useFetchTables';

export const CreateContextPage = () => {
  const navigate = useNavigate();

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

  const { mutate: submitContext } = useSubmitContext();

  const [teamId, setTeamId] = useState<string>('');
  const [tableId, setTableId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (userinfo?.groups && userinfo.groups.length > 0) {
      setTeamId(userinfo.groups[0].id);
    }
  }, [userinfo]);

  useEffect(() => {
    if (tablesData && tablesData.length > 0) {
      setTableId(tablesData[0].id);
    }
  }, [tablesData]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (teamId && name && tableId) {
      setIsSubmitting(true); // Start submission
      submitContext(
        { teamId, tableId, name },
        {
          onSuccess: (data) => {
            setIsSubmitting(false);
            navigate(`/context/${data.data.id}/${data.data.tableId}`);
          },
          onError: () => {
            setIsSubmitting(false);
          },
        }
      );
    } else {
      console.error('teamId, tableId, and contextName must be provided');
    }
  };

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

  const isButtonDisabled = !teamId || !tableId || !name || isSubmitting;

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      marginTop="8rem"
    >
      <Form style={{ width: '40%' }} onSubmit={handleSubmit}>
        <Heading size="lg" marginBottom="2rem">
          Opprett kontekst
        </Heading>
        <Box marginBottom="1rem">
          <FormLabel htmlFor="select">Velg team</FormLabel>
          <FormControl>
            <Select
              id="select"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              {userinfo.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.displayName}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box marginBottom="1rem">
          <FormLabel htmlFor="tableSelect">Velg tabell</FormLabel>
          <FormControl>
            <Select
              id="tableSelect"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
            >
              {tablesData?.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box marginBottom="1rem">
          <FormControl>
            <FormLabel htmlFor="contextName">Navn på kontekst</FormLabel>
            <Input
              id="contextName"
              type="text"
              placeholder="Skriv inn navn på kontekst"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
            />
          </FormControl>
        </Box>
        <Button type="submit" variant="primary" disabled={isButtonDisabled}>
          {isSubmitting ? <Spinner size="sm" /> : 'Opprett'}
        </Button>
      </Form>
    </Stack>
  );
};
