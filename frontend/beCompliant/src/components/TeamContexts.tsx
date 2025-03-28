import {
  Skeleton,
  VStack,
  Text,
  useDisclosure,
  Flex,
  Link,
  IconButton,
} from '@kvib/react';
import { Link as ReactRouterLink } from 'react-router';
import { useContext, useTeamContexts } from '../hooks/useContext';
import { DeleteContextModal } from './DeleteContextModal';
import { useForms } from '../hooks/useForms';

export default function TeamContexts({ teamId }: { teamId: string }) {
  const { data: contexts = [], isPending: contextsIsPending } =
    useTeamContexts(teamId);

  const { data: forms, isPending: formsPending } = useForms();

  const uniqueFormIds = Array.from(
    new Set(contexts?.map((context) => context.formId))
  );

  const contextForms = forms?.filter((table) =>
    uniqueFormIds.includes(table.id)
  );

  return (
    <VStack alignItems="start" marginLeft={8}>
      <Skeleton
        loading={contextsIsPending || formsPending}
        minH="40px"
        minW="200px"
      >
        {contextForms?.map((form) => {
          const contextsForForm = contexts.filter(
            (context) => context.formId === form.id
          );

          return (
            <VStack alignItems="start" key={form.id}>
              <Text>{form.name}</Text>
              <VStack alignItems="start" pl={4}>
                {contextsForForm.map((context) => (
                  <ContextLink key={context.id} contextId={context.id} />
                ))}
              </VStack>
            </VStack>
          );
        })}
      </Skeleton>
    </VStack>
  );
}

function ContextLink({ contextId }: { contextId: string }) {
  const {
    open: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const { data: context, isPending: contextIsPending } = useContext(contextId);

  return (
    <Flex alignItems="center" key={contextId}>
      <Skeleton loading={contextIsPending}>
        <Link asChild colorPalette="blue">
          <ReactRouterLink to={`/context/${contextId}`}>
            {context?.name}
          </ReactRouterLink>
        </Link>
        <IconButton
          aria-label="Slett utfylling"
          colorPalette="red"
          variant="tertiary"
          icon="delete"
          onClick={() => onDeleteOpen()}
        />
      </Skeleton>
      <DeleteContextModal
        onOpen={onDeleteOpen}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        teamId={context?.teamId ?? ''}
        contextId={contextId}
      />
    </Flex>
  );
}
