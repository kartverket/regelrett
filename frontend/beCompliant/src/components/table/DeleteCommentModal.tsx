import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@kvib/react';
import { useDeleteComment } from '../../hooks/useDeleteComment';
import { User } from '../../api/types';

type Props = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  comment: string;
  questionId: string;
  recordId: string;
  team: string | undefined;
  functionId?: number;
  tableId: string;
  setEditMode: (value: boolean) => void;
  setCommentDeleted?: (deleted: boolean) => void;
  user: User;
};
export function DeleteCommentModal({
  onClose,
  isOpen,
  comment,
  questionId,
  recordId,
  team,
  functionId,
  tableId,
  setEditMode,
  setCommentDeleted,
  user,
}: Props) {
  const handleDeleteSuccess = () => {
    setEditMode(false);
    setCommentDeleted?.(true);
    onClose();
  };

  const { mutate: deleteComment, isPending: isLoading } =
    useDeleteComment(handleDeleteSuccess);

  const handleCommentDelete = async () => {
    deleteComment({
      actor: user.id,
      recordId: recordId,
      questionId: questionId,
      team: team ?? null,
      functionId: functionId ?? null,
      tableId: tableId,
      comment: comment,
      updated: new Date(),
    });
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Slett kommentar</ModalHeader>
        <ModalBody>
          <Stack>
            <Text size="sm">Er du sikker på at du vil slette kommentaren?</Text>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack justifyContent="end">
            <Button variant="tertiary" colorScheme="blue" onClick={onClose}>
              Avbryt
            </Button>
            <Button
              aria-label="Slett kommentar"
              variant="primary"
              colorScheme="red"
              leftIcon="delete"
              onClick={handleCommentDelete}
              isLoading={isLoading}
            >
              Slett kommentar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
