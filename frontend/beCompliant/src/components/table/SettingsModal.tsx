import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton,
  Stack,
  useToast,
} from '@kvib/react';
import { useFetchUserinfo } from '../../hooks/useFetchUserinfo';
import { useFetchContext } from '../../hooks/useFetchContext';
import { useParams } from 'react-router-dom';
import { apiConfig } from '../../api/apiConfig';
import { axiosFetch } from '../../api/Fetch';
import { useFetchAllContexts } from '../../hooks/useFetchAllContexts';
import { Context } from '../../hooks/useFetchTeamContexts';

type Props = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
};
export function SettingsModal({ onClose, isOpen }: Props) {
  const params = useParams();
  const contextId = params.contextId;
  const toast = useToast();

  const { data: userinfo } = useFetchUserinfo();
  const currentContext = useFetchContext(contextId);

  const { data: contexts, isPending: contextsIsLoading } =
    useFetchAllContexts();

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contextId) return;
    const form = e.target as HTMLFormElement;
    const changeTeamElement = form.elements.namedItem(
      'editTeam'
    ) as HTMLSelectElement;
    const copyContextElement = form.elements.namedItem(
      'copyContextSelect'
    ) as HTMLSelectElement;

    if (changeTeamElement?.value) {
      const newTeamId = changeTeamElement.value;
      try {
        const response = await axiosFetch({
          url: apiConfig.contexts.forIdAndTeam.url(contextId) + '/team',
          method: 'PATCH',
          data: {
            teamId: newTeamId,
          },
        });
        if (response.status === 200 || response.status === 204) {
          onClose();
        }
      } catch (error) {
        const toastId = 'change-context-team-error';
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'Å nei!',
            description: 'Det har skjedd en feil. Prøv på nytt',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
    if (copyContextElement?.value) {
      try {
        const response = await axiosFetch({
          url: apiConfig.contexts.byId.url(contextId) + '/answers',
          method: 'PATCH',
          data: {
            copyContextId: copyContextElement.value,
          },
        });
        if (response.status === 200 || response.status === 204) {
          onClose();
        }
      } catch (error) {
        const toastId = 'copy-context-error';
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'Å nei!',
            description: 'Det har skjedd en feil. Prøv på nytt',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  };

  const contextsForTable: Context[] =
    contexts?.filter(
      (context) =>
        context.tableId === currentContext.data?.tableId &&
        context.id !== currentContext.data?.id
    ) ?? [];

  const isDisabled = contextsForTable.length === 0;

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Endre skjemautfylling</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSettingsSubmit}>
            <Stack gap="1rem">
              <FormControl>
                <FormLabel>
                  Endre teamet dette skjemaet skal gjelde for:
                </FormLabel>
                <Select name="editTeam" placeholder="Velg team">
                  {userinfo?.groups.map((team) => {
                    if (team.id === currentContext.data?.teamId) {
                      return null;
                    }
                    return (
                      <option key={team.id} value={team.id}>
                        {team.displayName}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Kopier svar fra et annet skjema:</FormLabel>
                <Skeleton isLoaded={!contextsIsLoading}>
                  <Select
                    name="copyContextSelect"
                    placeholder={
                      isDisabled
                        ? 'Ingen eksisterende skjema funnet'
                        : 'Velg skjema'
                    }
                    bgColor="white"
                    borderColor="gray.200"
                  >
                    {contextsForTable?.map((context) => (
                      <option key={context.id} value={context.id}>
                        {context.name}
                      </option>
                    ))}
                  </Select>
                </Skeleton>
              </FormControl>

              <HStack justifyContent="end">
                <Button
                  variant="secondary"
                  colorScheme="blue"
                  onClick={onClose}
                >
                  Avbryt
                </Button>

                <Button
                  aria-label="Endre team"
                  variant="primary"
                  colorScheme="blue"
                  type="submit"
                >
                  Lagre
                </Button>
              </HStack>
            </Stack>
          </form>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
