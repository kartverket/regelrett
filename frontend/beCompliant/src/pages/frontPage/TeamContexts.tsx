import {
  Skeleton,
  VStack,
  Text,
  useDisclosure,
  CardRoot,
  CardBody,
  Button,
  KvibProgressCircle,
  AbsoluteCenter,
  HStack,
  Tooltip,
  Flex,
} from '@kvib/react';
import { Link as ReactRouterLink } from 'react-router';
import { useContext, useTeamContexts } from '../../hooks/useContext';
import { DeleteContextModal } from './DeleteContextModal';
import { Answer } from '../../api/types';
import { useForm } from '../../hooks/useForm';
import { useForms } from '../../hooks/useForms';
import { useAnswers } from '../../hooks/useAnswers';
import { groupByField } from '../../utils/mapperUtil';
import { ActiveFilter } from '../../types/tableTypes';

export default function TeamContexts({ teamId }: { teamId: string }) {
  const { data: contexts = [], isPending: contextsIsPending } =
    useTeamContexts(teamId);

  const { data: forms, isPending: formsPending } = useForms();

  if (!contextsIsPending && contexts.length === 0)
    return <Text>Dette teamet har ingen skjemautfyllinger</Text>;

  const uniqueFormIds = Array.from(
    new Set(contexts?.map((context) => context.formId))
  );

  console.log(uniqueFormIds);
  console.log(forms);

  const contextForms = forms?.filter((table) =>
    uniqueFormIds.includes(table.id)
  );

  return (
    <Skeleton
      loading={contextsIsPending || formsPending}
      minH="40px"
      minW="200px"
    >
      <Flex gap="24px" direction={{ base: 'column', lg: 'row' }}>
        {contextForms?.map((form) => {
          const contextsForForm = contexts.filter(
            (context) => context.formId === form.id
          );

          return (
            <VStack alignItems="start" key={form.id} gap="16px">
              <Text fontSize="xl" fontWeight="bold">
                {form.name}
              </Text>
              <VStack alignItems="start" gap="16px">
                {contextsForForm.map((context) => (
                  <ContextLink
                    key={context.id}
                    contextId={context.id}
                    formId={form.id}
                  />
                ))}
              </VStack>
            </VStack>
          );
        })}
      </Flex>
    </Skeleton>
  );
}

function ContextLink({
  contextId,
  formId,
}: {
  contextId: string;
  formId: string;
}) {
  const {
    open: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  function TruncatedText({
    str,
    maxLength,
  }: {
    str: string;
    maxLength: number;
  }) {
    if (str.length > maxLength) {
      return (
        <Tooltip content={str}>
          <Text fontSize="lg" fontWeight="bold">
            {str.slice(0, maxLength)}...
          </Text>
        </Tooltip>
      );
    } else {
      return (
        <Text fontSize="lg" fontWeight="bold">
          {str}
        </Text>
      );
    }
  }

  const { data: context, isPending: contextIsPending } = useContext(contextId);

  return (
    <Skeleton loading={contextIsPending}>
      {context && (
        <ReactRouterLink
          to={`/context/${contextId}?${JSON.parse(
            localStorage.getItem(`filters_${context.formId}`) || `[]`
          )
            .map(
              (filter: ActiveFilter) => `filter=${filter.id}_${filter.value}`
            )
            .join('&')}`}
        >
          <CardRoot
            minWidth="450px"
            _hover={{ bg: 'gray.100', boxShadow: 'md' }}
          >
            <CardBody alignSelf="start" width="100%" padding="16px">
              <HStack justifyContent="space-between">
                <VStack alignItems="start" gap="0">
                  <TruncatedText str={context?.name ?? ''} maxLength={27} />
                  <Button
                    p="0"
                    aria-label="Slett utfylling"
                    colorPalette="red"
                    variant="tertiary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onDeleteOpen();
                    }}
                  >
                    Slett skjemautfyllingen
                  </Button>
                </VStack>
                <ProgressCircle contextId={contextId} formId={formId} />
              </HStack>
            </CardBody>
          </CardRoot>
        </ReactRouterLink>
      )}
      <DeleteContextModal
        onOpen={onDeleteOpen}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        teamId={context?.teamId ?? ''}
        contextId={contextId}
      />
    </Skeleton>
  );
}

function ProgressCircle({
  contextId,
  formId,
}: {
  contextId: string;
  formId: string;
}) {
  const { data: formData, isPending: formIsPending } = useForm(formId);

  const { data: answers, isPending: answerIsPending } = useAnswers(contextId);

  const recordsWithAnswers = formData?.records.map((question) => ({
    ...question,
    answers:
      groupByField<Answer>(answers ?? [], 'questionId')[question.id] || [],
  }));

  const numberOfAnswers = recordsWithAnswers?.reduce((count, data) => {
    if (data.answers?.[0]?.answer && data.answers.at(-1)?.answer !== '') {
      count++;
    }
    return count;
  }, 0);

  const percentageAnswered = recordsWithAnswers?.length
    ? Math.round(((numberOfAnswers ?? 0) / recordsWithAnswers.length) * 100)
    : 0;

  return (
    <Skeleton loading={formIsPending || answerIsPending}>
      <KvibProgressCircle.Root
        value={isNaN(percentageAnswered) ? 0 : percentageAnswered}
        size="xl"
        colorPalette="blue"
      >
        <KvibProgressCircle.Circle>
          <KvibProgressCircle.Track />
          <KvibProgressCircle.Range strokeLinecap="round" />
        </KvibProgressCircle.Circle>
        <AbsoluteCenter>
          <KvibProgressCircle.Label>
            <Text fontWeight="bold">
              {numberOfAnswers}/{recordsWithAnswers?.length}
            </Text>
          </KvibProgressCircle.Label>
        </AbsoluteCenter>
      </KvibProgressCircle.Root>
    </Skeleton>
  );
}
