import {
  Flex,
  Text,
  Textarea,
  useDisclosure,
  Button,
  FlexProps,
} from '@kvib/react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { DeleteCommentModal } from '../table/DeleteCommentModal';
import { Question, User } from '../../api/types';
import { useSubmitComment } from '../../hooks/useComments';

type Props = FlexProps & {
  question: Question;
  latestComment: string;
  contextId: string;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  user: User;
};

export function QuestionComment({
  question,
  latestComment,
  contextId,
  isEditing,
  setIsEditing,
  user,
  ...rest
}: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [editedComment, setEditedComment] = useState<string | null>(null);

  const { mutate: submitComment, isPending: isLoading } = useSubmitComment(
    contextId,
    question.recordId,
    setIsEditing
  );
  const {
    open: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleCommentSubmit = () => {
    if (editedComment !== latestComment && editedComment != null) {
      submitComment({
        actor: user.id,
        recordId: question.recordId,
        questionId: question.id,
        comment: editedComment ?? latestComment,
        contextId: contextId,
      });
    }
  };

  const handleDiscardChanges = () => {
    setEditedComment(latestComment);
    setIsEditing(false);
  };

  // set focus to text area when creating or editing comment
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textArea = textAreaRef.current;
      textArea.focus();
      textArea.setSelectionRange(textArea.value.length, textArea.value.length);
    }
  }, [isEditing]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (textAreaRef.current !== document.activeElement) return;

    if (event.key === 'Escape') {
      handleDiscardChanges();
    }
  };

  return (
    <Flex flexDirection="column" {...rest}>
      <Text fontWeight="bold" fontSize="lg" pb="4">
        Kommentar
      </Text>
      {isEditing ? (
        <Flex gap="4" flexDirection="column">
          <Textarea
            ref={textAreaRef}
            defaultValue={editedComment ?? latestComment}
            onChange={(e) => setEditedComment(e.target.value)}
            colorPalette="blue"
            background="white"
            onKeyDown={(ev) => {
              handleKeyDown(ev);
            }}
          />
          <Flex gap="6">
            <Button
              aria-label="Lagre kommentar"
              colorPalette="blue"
              leftIcon="check"
              variant="secondary"
              size="sm"
              onClick={handleCommentSubmit}
              loading={isLoading}
              disabled={editedComment === latestComment}
            >
              Lagre
            </Button>
            <Button
              aria-label="Slett kommentar"
              colorPalette="red"
              leftIcon="close"
              variant="secondary"
              size="sm"
              onClick={handleDiscardChanges}
            >
              Avbryt
            </Button>
          </Flex>
        </Flex>
      ) : latestComment === '' ? (
        <Button
          aria-label="Legg til kommentar"
          size="sm"
          variant="secondary"
          colorPalette="blue"
          leftIcon="add"
          onClick={() => setIsEditing(true)}
          w="fit-content"
        >
          Ny kommentar
        </Button>
      ) : (
        <>
          <Flex gap="4" flexDirection="column">
            <Text
              maxWidth="328px"
              overflow="hidden"
              whiteSpace="pre-wrap"
              fontSize="md"
            >
              {latestComment}
            </Text>
            <Flex gap="6">
              <Button
                aria-label="Rediger kommentar"
                colorPalette="blue"
                leftIcon="edit"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditedComment(latestComment);
                  setIsEditing(true);
                }}
              >
                Rediger
              </Button>
              <Button
                aria-label="Slett kommentar"
                colorPalette="red"
                leftIcon="delete"
                variant="secondary"
                size="sm"
                onClick={onDeleteOpen}
              >
                Slett
              </Button>
            </Flex>
          </Flex>
          <DeleteCommentModal
            onOpen={onDeleteOpen}
            onClose={onDeleteClose}
            isOpen={isDeleteOpen}
            recordId={question.recordId}
            contextId={contextId}
          />
        </>
      )}
    </Flex>
  );
}
