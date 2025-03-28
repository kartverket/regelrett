import { useNavigate, useSearchParams } from 'react-router';
import { useForms } from '../hooks/useForms';
import {
  Text,
  Center,
  Heading,
  Icon,
  Stack,
  SelectLabel,
  SelectTrigger,
  SelectValueText,
  SelectIndicatorGroup,
  SelectIndicator,
  SelectContent,
  SelectRoot,
  SelectItem,
  FieldRoot,
  FieldLabel,
  Input,
  Button,
  Spinner,
  createListCollection,
} from '@kvib/react';
import { FormEvent, useMemo } from 'react';
import { useSubmitContext } from '../hooks/useContext';
import RedirectBackButton from '../components/RedirectBackButton';
import { CopyContextDropdown } from '../components/createContextPage/CopyContextDropdown';
import { useUser } from '../hooks/useUser';

export default function CreateContextPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const teamId = searchParams.get('teamId');
  const name = searchParams.get('name');
  const formId = searchParams.get('formId');
  const redirect = searchParams.get('redirect');

  const copyContext = searchParams.get('copyContext');

  const { mutate: submitContext, isPending: isLoading } = useSubmitContext();

  const {
    data: formData,
    error: formError,
    isPending: formIsPending,
  } = useForms();

  const {
    data: userData,
    isPending: isUserLoading,
    isError: isUserError,
  } = useUser();

  const forms = useMemo(() => {
    return createListCollection({
      items: formData ?? [],
      itemToString: (form) => form.name,
      itemToValue: (form) => form.id,
    });
  }, [formData]);

  const teams = useMemo(() => {
    return createListCollection({
      items: userData?.groups ?? [],
      itemToString: (group) => group.displayName,
      itemToValue: (group) => group.id,
    });
  }, [userData?.groups]);

  if (formError || isUserError) {
    return (
      <>
        <RedirectBackButton />
        <Center height="70svh" flexDirection="column" gap="4">
          <Icon icon="error" size={64} weight={600} />
          <Heading size="md">Noe gikk galt, prøv gjerne igjen</Heading>
        </Center>
      </>
    );
  }

  const isButtonDisabled = !teamId || !formId || !name || isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (teamId && name && formId) {
      submitContext(
        { teamId, formId: formId, name, copyContext },
        {
          onSuccess: (data) => {
            if (redirect) {
              const incomingRedirect = decodeURIComponent(redirect)
                .replace('{contextId}', data.data.id)
                .replace('{tableId}', formId) // Dette er til FRISK tror jeg - vent med å oppdatere?
                .replace('{contextName}', data.data.name)
                .replace(
                  '{tableName}',
                  formData?.find((form) => form.id === data.data.formId)
                    ?.name ?? formId
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
      console.error('teamId, formId, and contextName must be provided');
    }
  };

  return (
    <>
      <RedirectBackButton />
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        marginTop="8rem"
      >
        <form onSubmit={handleSubmit}>
          <Text fontSize="3xl" fontWeight="bold" mb="32px">
            Opprett sikkerhetsskjema
          </Text>
          <Stack gap="16px">
            <SelectRoot
              id="teamSelect"
              collection={teams}
              required
              value={teamId ? [teamId] : []}
              onValueChange={(e) =>
                setSearchParams(
                  (current) => {
                    current.set('teamId', e.value[0]);
                    return current;
                  },
                  { replace: true }
                )
              }
              borderColor="gray.200"
              min-height="6"
            >
              <SelectLabel fontWeight="bold">Velg team</SelectLabel>
              <SelectTrigger bgColor="white">
                <SelectValueText placeholder="Velg team" />
                <SelectIndicatorGroup>
                  {isUserLoading && <Spinner size="xs" borderWidth="1.5px" />}
                  <SelectIndicator />
                </SelectIndicatorGroup>
              </SelectTrigger>
              <SelectContent>
                {teams.items.map((team) => (
                  <SelectItem key={team.id} item={team}>
                    {team.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SelectRoot
              id="formSelect"
              collection={forms}
              required
              value={formId ? [formId] : []}
              onValueChange={(e) =>
                setSearchParams(
                  (current) => {
                    current.set('formId', e.value[0]);
                    return current;
                  },
                  { replace: true }
                )
              }
            >
              <SelectLabel fontWeight="bold">Velg sikkerhetsskjema</SelectLabel>
              <SelectTrigger bgColor="white">
                <SelectValueText placeholder="Velg skjema" />
                <SelectIndicatorGroup>
                  {formIsPending && <Spinner size="xs" borderWidth="1.5px" />}
                  <SelectIndicator />
                </SelectIndicatorGroup>
              </SelectTrigger>
              <SelectContent>
                {forms.items.map((form) => (
                  <SelectItem key={form.id} item={form}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>

            {formId && formId.trim() && teamId && teamId.trim() && (
              <CopyContextDropdown
                setCopyContext={(newContext) =>
                  setSearchParams(
                    (current) => {
                      current.set('copyContext', newContext);
                      return current;
                    },
                    { replace: true }
                  )
                }
              />
            )}

            <FieldRoot>
              <FieldLabel fontWeight="bold">Navn på skjemautfylling</FieldLabel>
              <Input
                id="contextName"
                type="text"
                placeholder="Skriv inn navn på skjemautfylling"
                value={searchParams.get('name') ?? ''}
                onChange={(e) =>
                  setSearchParams(
                    (current) => {
                      current.set('name', e.target.value);
                      return current;
                    },
                    { replace: true }
                  )
                }
                required
                bgColor="white"
                borderRadius="0"
              />
            </FieldRoot>
            <Button
              type="submit"
              variant="solid"
              colorPalette="blue"
              disabled={isButtonDisabled}
            >
              {isLoading ? <Spinner size="sm" /> : 'Opprett skjema'}
            </Button>
          </Stack>
        </form>
      </Stack>
    </>
  );
}
