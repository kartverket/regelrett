import {
  Flex,
  Text,
  Textarea,
  useDisclosure,
  Divider,
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
    isOpen: isDeleteOpen,
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
      <Divider marginBottom="2" borderWidth="1px" borderColor="gray.300" />
      <Text as="b" fontSize="lg">
        Kommentar
      </Text>
      {isEditing && (
        <Flex gap="6" flexDirection="column">
          <Textarea
            ref={textAreaRef}
            defaultValue={editedComment ?? latestComment}
            onChange={(e) => setEditedComment(e.target.value)}
            background="white"
            onKeyDown={(ev) => {
              handleKeyDown(ev);
            }}
          />
          <Flex justifyContent="right" gap="4">
            <Button
              aria-label="Lagre kommentar"
              colorScheme="blue"
              leftIcon="check"
              variant="secondary"
              onClick={handleCommentSubmit}
              isLoading={isLoading}
              isDisabled={editedComment === latestComment}
            >
              Lagre
            </Button>
            <Button
              aria-label="Slett kommentar"
              colorScheme="red"
              leftIcon="close"
              variant="secondary"
              onClick={handleDiscardChanges}
            >
              Ikke lagre
            </Button>
          </Flex>
        </Flex>
      )}
      {!isEditing && (
        <>
          <Flex gap="2" flexDirection="column">
            <Text
              maxWidth="328px"
              overflow="hidden"
              whiteSpace="pre-wrap"
              fontSize="md"
            >
              {latestComment}
            </Text>
            <Flex justifyContent="right">
              <Button
                aria-label="Rediger kommentar"
                colorScheme="blue"
                leftIcon="edit"
                variant="tertiary"
                onClick={() => {
                  setEditedComment(latestComment);
                  setIsEditing(true);
                }}
              >
                Rediger
              </Button>
              <Button
                aria-label="Slett kommentar"
                colorScheme="red"
                leftIcon="delete"
                variant="tertiary"
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
      <Divider marginTop="6" borderWidth="1px" borderColor="gray.300" />
    </Flex>
  );
}
