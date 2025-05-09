import {
  Button,
  createListCollection,
  Flex,
  HStack,
  Input,
  KvibDialog,
  KvibField,
  KvibTabs,
  Portal,
  RadioGroupItem,
  RadioGroupItemHiddenInput,
  RadioGroupItemIndicator,
  RadioGroupItemText,
  RadioGroupRoot,
  SelectContent,
  SelectIndicator,
  SelectIndicatorGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Spinner,
  Stack,
  Text,
  toaster,
  VStack,
} from '@kvib/react';
import {
  useContext,
  useFetchAllContexts,
  useChangeTeamForContext,
  useCopyContextAnswers,
  useCopyContextComments,
} from '../../../hooks/useContext';
import { useParams } from 'react-router';
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react';

type Props = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  currentTeamName: string | undefined;
  onCopySuccess: () => void;
};

export function SettingsModal({
  open,
  setOpen,
  currentTeamName,
  onCopySuccess,
}: Props) {
  const params = useParams();
  const contextId = params.contextId;
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [radioError, setRadioError] = useState(false);
  const [selectError, setSelectError] = useState(false);

  const currentContext = useContext(contextId);

  const { data: contexts, isPending: contextsIsLoading } =
    useFetchAllContexts();

  const teamSubmitMutation = useChangeTeamForContext({
    onSuccess: () => setOpen(false),
    contextId: contextId,
    currentTeamName: currentTeamName || '',
  });

  const {
    mutateAsync: mutateCopyComments,
    isPending: pendingCopyComments,
    status: statusCopyComments,
  } = useCopyContextComments({
    contextId,
    onError: onCopyMutationError,
  });

  const {
    mutate: mutateCopyAnswers,
    isPending: pendingCopyAnswers,
    isSuccess: isSuccessCopyAnswers,
  } = useCopyContextAnswers({
    contextId,
    onError: onCopyMutationError,
  });

  function onCopyMutationSuccess(copyContextName: string) {
    setOpen(false);
    onCopySuccess();
    const toastId = 'copy-context-success';
    if (!toaster.isVisible(toastId)) {
      toaster.create({
        title: 'Svar kopiert!',
        description: `Skjemaet inneholder nå samme svar som ${copyContextName}`,
        type: 'success',
        duration: 5000,
      });
    }
  }

  function onCopyMutationError() {
    const toastId = 'copy-context-error';
    if (!toaster.isVisible(toastId)) {
      toaster.create({
        id: toastId,
        title: 'Kunne ikke kopiere svar',
        description:
          'Svarene ble ikke kopiert. Kontroller tilgangen din og prøv på nytt.',
        type: 'error',
        duration: 5000,
      });
    }
  }

  const handleTeamSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contextId) return;

    const newTeam = new FormData(e.currentTarget).get('editTeam');
    if (!newTeam) return;

    teamSubmitMutation.mutate(newTeam as string);
  };

  const handleCopySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contextId) return;

    const copyContextId = (
      e.currentTarget.elements.namedItem(
        'copySelect'
      ) as HTMLSelectElement | null
    )?.value;

    const copyComments = (
      e.currentTarget.elements.namedItem(
        'select-copy-comments'
      ) as HTMLInputElement | null
    )?.value;

    if (!copyContextId || !copyComments) {
      !copyContextId && setSelectError(true);
      !copyComments && setRadioError(true);
      return;
    }

    const copyContextName = contextsCollection.items.find((context) => {
      return context.id === copyContextId;
    })?.name;

    mutateCopyAnswers(
      { copyContextId },
      {
        onSuccess: () => {
          if (statusCopyComments == 'success' || statusCopyComments == 'idle') {
            onCopyMutationSuccess(copyContextName ?? '');
          }
        },
      }
    );
    if (copyComments === 'yes') {
      mutateCopyComments(
        { copyContextId },
        {
          onSuccess: () => {
            if (isSuccessCopyAnswers) {
              onCopyMutationSuccess(copyContextName ?? '');
            }
          },
        }
      );
    }
  };

  const contextsCollection = useMemo(() => {
    return createListCollection({
      items:
        contexts?.filter(
          (context) =>
            context.formId === currentContext.data?.formId &&
            context.id !== currentContext.data?.id
        ) ?? [],
      itemToString: (context) => context.name,
      itemToValue: (context) => context.id,
    });
  }, [contexts, currentContext.data?.formId, currentContext.data?.id]);

  const isDisabled = contextsCollection.size === 0;

  const resetCopyForm = () => {
    setRadioError(false);
    setSelectError(false);
  };

  return (
    <KvibDialog.Root
      lazyMount
      open={open}
      placement="center"
      onOpenChange={(e) => {
        setOpen(e.open);
      }}
    >
      <KvibDialog.Backdrop onMouseEnter={resetCopyForm} />
      <Portal>
        <KvibDialog.Positioner>
          <KvibDialog.Content ref={dialogContentRef}>
            <KvibDialog.Header fontSize="xl">
              Rediger skjemautfylling
            </KvibDialog.Header>
            <KvibDialog.Body>
              <KvibTabs.Root defaultValue="team" size="sm">
                <KvibTabs.List>
                  <KvibTabs.Trigger value="team">Endre team</KvibTabs.Trigger>
                  <KvibTabs.Trigger value="copy">Kopier svar</KvibTabs.Trigger>
                </KvibTabs.List>

                <KvibTabs.Content value="team">
                  <form onSubmit={handleTeamSubmit}>
                    <Stack gap="1rem">
                      <VStack alignItems="start" gap="0">
                        <Text fontWeight="700">Skjemaet tilhører teamet: </Text>
                        <Text>{currentTeamName}</Text>
                      </VStack>
                      <KvibField.Root invalid={teamSubmitMutation.isError}>
                        <KvibField.Label>
                          Skriv inn teamnavnet skjemaet skal gjelde for:
                        </KvibField.Label>
                        <Input
                          name="editTeam"
                          placeholder="Teamnavn"
                          aria-label="Teameier bytte av skjemautfylling input"
                          type="search"
                          size="md"
                        />
                        <KvibField.ErrorText>
                          Teamet finnes ikke. Sjekk at du har skrevet riktig.
                        </KvibField.ErrorText>
                      </KvibField.Root>
                      <HStack justifyContent="end" mt={4}>
                        <Button
                          variant="secondary"
                          colorPalette="blue"
                          onClick={() => {
                            teamSubmitMutation.reset();
                            setOpen(false);
                          }}
                        >
                          Avbryt
                        </Button>
                        <Button
                          aria-label="Endre team"
                          variant="primary"
                          colorPalette="blue"
                          type="submit"
                        >
                          Lagre
                        </Button>
                      </HStack>
                    </Stack>
                  </form>
                </KvibTabs.Content>

                <KvibTabs.Content value="copy">
                  <form onSubmit={handleCopySubmit}>
                    <Stack gap="1rem">
                      <KvibField.Root invalid={selectError}>
                        <SelectRoot
                          name="copySelect"
                          collection={contextsCollection}
                          bgColor="white"
                          borderColor="gray.200"
                          disabled={isDisabled}
                          invalid={selectError}
                          onChange={() => setSelectError(false)}
                        >
                          <SelectLabel>
                            Kopier svar fra eksisterende skjema:
                          </SelectLabel>
                          <SelectTrigger>
                            <SelectValueText
                              placeholder={
                                isDisabled
                                  ? 'Ingen eksisterende skjema funnet'
                                  : 'Velg skjema'
                              }
                            />
                            <SelectIndicatorGroup>
                              {contextsIsLoading && (
                                <Spinner size="xs" borderWidth="1.5px" />
                              )}
                              <SelectIndicator />
                            </SelectIndicatorGroup>
                          </SelectTrigger>

                          <Portal container={dialogContentRef}>
                            <SelectContent zIndex="max">
                              {contextsCollection.items.map((context) => (
                                <SelectItem key={context.id} item={context}>
                                  {context.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Portal>
                          <KvibField.ErrorText>
                            Du må velge et skjema før du går videre.
                          </KvibField.ErrorText>
                        </SelectRoot>
                      </KvibField.Root>
                      <Flex flexDirection="column" gap="2">
                        <Text> Vil du også kopiere kommentarene?</Text>
                        <KvibField.Root invalid={radioError}>
                          <RadioGroupRoot
                            orientation="vertical"
                            name="select-copy-comments"
                            colorPalette={'blue'}
                          >
                            <VStack align="start">
                              <RadioGroupItem
                                key="yes"
                                value={'yes'}
                                onChange={() => setRadioError(false)}
                              >
                                <RadioGroupItemHiddenInput />
                                <RadioGroupItemIndicator />
                                <RadioGroupItemText>Ja</RadioGroupItemText>
                              </RadioGroupItem>
                              <RadioGroupItem
                                key="no"
                                value="no"
                                onChange={() => setRadioError(false)}
                              >
                                <RadioGroupItemHiddenInput />
                                <RadioGroupItemIndicator />
                                <RadioGroupItemText>Nei</RadioGroupItemText>
                              </RadioGroupItem>
                            </VStack>
                            <KvibField.ErrorText>
                              Du må velge om kommentarene skal kopieres.
                            </KvibField.ErrorText>
                          </RadioGroupRoot>
                        </KvibField.Root>
                      </Flex>

                      <HStack justifyContent="end" mt={4}>
                        <Button
                          variant="secondary"
                          colorPalette="blue"
                          onClick={() => {
                            resetCopyForm();
                            setOpen(false);
                          }}
                        >
                          Avbryt
                        </Button>
                        <Button
                          aria-label="Kopier svar"
                          variant="primary"
                          colorPalette="blue"
                          type="submit"
                          disabled={isDisabled}
                          loading={pendingCopyAnswers || pendingCopyComments}
                        >
                          Kopier
                        </Button>
                      </HStack>
                    </Stack>
                  </form>
                </KvibTabs.Content>
              </KvibTabs.Root>
            </KvibDialog.Body>
            <KvibDialog.Footer></KvibDialog.Footer>
          </KvibDialog.Content>
        </KvibDialog.Positioner>
      </Portal>
    </KvibDialog.Root>
  );
}
