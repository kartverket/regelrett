import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from '@kvib/react';
import {
  Context,
  useFetchAllContexts,
  useContext,
} from '../../hooks/useContext';
import { useParams } from 'react-router-dom';
import { apiConfig } from '../../api/apiConfig';
import { axiosFetch } from '../../api/Fetch';

type Props = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
};
export function SettingsModal({ onClose, isOpen }: Props) {
  const params = useParams();
  const contextId = params.contextId;
  const toast = useToast();

  const currentContext = useContext(contextId);

  const { data: contexts, isPending: contextsIsLoading } =
    useFetchAllContexts();

  const handleTeamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contextId) return;

    const newTeam = (
      e.currentTarget.elements.namedItem('editTeam') as HTMLSelectElement
    )?.value;

    if (!newTeam) {
      return;
    }

    try {
      const response = await axiosFetch({
        url: apiConfig.contexts.forIdAndTeam.url(contextId) + '/team',
        method: 'PATCH',
        data: {
          teamName: newTeam,
        },
      });

      if (response.status === 200 || response.status === 204) {
        const toastId = 'change-context-team-success';
        if (!toast.isActive(toastId)) {
          toast({
            title: 'Suksess!',
            description: 'Skjemaet har blitt flyttet',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
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
  };

  const handleCopySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contextId) return;

    const copyContextId = (
      e.currentTarget.elements.namedItem(
        'copyContextSelect'
      ) as HTMLSelectElement
    )?.value;

    if (!copyContextId) {
      return;
    }

    try {
      const response = await axiosFetch({
        url: apiConfig.contexts.byId.url(contextId) + '/answers',
        method: 'PATCH',
        data: {
          copyContextId,
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
  };

  const contextsForTable: Context[] =
    contexts?.filter(
      (context) =>
        context.formId === currentContext.data?.formId &&
        context.id !== currentContext.data?.id
    ) ?? [];

  const isDisabled = contextsForTable.length === 0;

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rediger skjemautfylling</ModalHeader>
        <ModalBody>
          <Tabs size="sm">
            <TabList>
              <Tab>Endre team</Tab>
              <Tab>Kopier svar</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <form onSubmit={handleTeamSubmit}>
                  <Stack gap="1rem">
                    <FormControl>
                      <FormLabel>
                        Skriv inn navnet til teamet dette skjemaet skal gjelde
                        for:
                      </FormLabel>
                      <Input
                        name="editTeam"
                        placeholder="Skriv inn team navn..."
                        aria-label="Teameier bytte av skjemautfylling input"
                        type="search"
                        size="md"
                      />
                    </FormControl>

                    <HStack justifyContent="end" mt={4}>
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
              </TabPanel>

              <TabPanel>
                <form onSubmit={handleCopySubmit}>
                  <Stack gap="1rem">
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
                          isDisabled={isDisabled}
                        >
                          {contextsForTable?.map((context) => (
                            <option key={context.id} value={context.id}>
                              {context.name}
                            </option>
                          ))}
                        </Select>
                      </Skeleton>
                    </FormControl>

                    <HStack justifyContent="end" mt={4}>
                      <Button
                        variant="secondary"
                        colorScheme="blue"
                        onClick={onClose}
                      >
                        Avbryt
                      </Button>
                      <Button
                        aria-label="Kopier svar"
                        variant="primary"
                        colorScheme="blue"
                        type="submit"
                        isDisabled={isDisabled}
                      >
                        Kopier
                      </Button>
                    </HStack>
                  </Stack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
