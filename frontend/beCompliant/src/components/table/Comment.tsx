import {
  Flex,
  IconButton,
  Text,
  Textarea,
  useDisclosure,
  Button,
} from '@kvib/react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { DeleteCommentModal } from './DeleteCommentModal';
import { LastUpdated } from './LastUpdated';
import { useCommentState } from './TableState';
import { User } from '../../api/types';
import { useSubmitComment } from '../../hooks/useComments';

// Replace with type from api when the internal data model is implemented
type Props = {
  comment: string;
  recordId: string;
  questionId: string;
  updated?: Date;
  contextId: string;
  user: User;
};

export function Comment({
  comment,
  recordId,
  questionId,
  updated,
  contextId,
  user,
}: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const {
    setEditedComment,
    setIsEditing,
    editedComment,
    isEditMode,
    setRowState,
  } = useCommentState(questionId);
  const [commentDeleted] = useState(false);

  const { mutate: submitComment, isPending: isLoading } = useSubmitComment(
    contextId,
    recordId,
    setIsEditing
  );
  const {
    open: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleDiscardChanges = () => {
    setRowState(questionId, {
      comment: { isEditMode: false, editedComment: comment },
    });
  };

  // set focus to text area when creating or editing comment
  useEffect(() => {
    if (isEditMode && textAreaRef.current) {
      const textArea = textAreaRef.current;
      textArea.focus();
      textArea.setSelectionRange(textArea.value.length, textArea.value.length);
    }
  }, [isEditMode]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (textAreaRef.current !== document.activeElement) return;

    if (event.key === 'Escape') {
      handleDiscardChanges();
    }
  };

  if (isEditMode) {
    return (
      <Flex minWidth="200px" gap="2" flexDirection="column">
        <Textarea
          ref={textAreaRef}
          defaultValue={editedComment ?? comment}
          onChange={(e) => setEditedComment(e.target.value)}
          size="md"
          background="white"
          height="88px"
          onKeyDown={(ev) => {
            handleKeyDown(ev);
          }}
        />
        <Flex gap="4">
          <Button
            aria-label="Lagre kommentar"
            size="sm"
            colorPalette="blue"
            variant="secondary"
            onClick={() => {
              if (editedComment !== comment && editedComment != null) {
                submitComment({
                  actor: user.id,
                  recordId: recordId,
                  questionId: questionId,
                  comment: editedComment ?? comment,
                  contextId: contextId ?? null,
                });
              }
            }}
            loading={isLoading}
            disabled={editedComment === comment}
          >
            Lagre
          </Button>
          <Button
            aria-label="Slett kommentar"
            size="sm"
            colorPalette="red"
            variant="secondary"
            onClick={() => {
              handleDiscardChanges();
            }}
            disabled={isLoading}
          >
            Avbryt
          </Button>
        </Flex>
      </Flex>
    );
  }

  // change this when the new data model is implemented. Because this should not be an empty string
  if (comment === '' || commentDeleted) {
    return (
      <IconButton
        aria-label="Legg til kommentar"
        colorPalette="blue"
        icon="add_comment"
        variant="secondary"
        onClick={() => {
          setRowState(questionId, {
            comment: { editedComment: comment, isEditMode: true },
          });
        }}
        marginBottom={updated ? '0' : '6'}
      />
    );
  }
  return (
    <>
      <Flex
        minWidth="200px"
        gap="2"
        marginBottom={updated ? '0' : '6'}
        flexDirection="column"
      >
        <Text
          maxWidth="328px"
          overflow="hidden"
          whiteSpace="pre-wrap"
          fontSize="md"
        >
          {comment}
        </Text>
        <Flex gap="4" pb="1">
          <Button
            aria-label="Rediger kommentar"
            colorPalette="blue"
            size="sm"
            leftIcon="edit"
            variant="secondary"
            onClick={() => {
              setRowState(questionId, {
                comment: { editedComment: comment, isEditMode: true },
              });
            }}
          >
            Rediger
          </Button>
          <Button
            aria-label="Slett kommentar"
            colorPalette="red"
            size="sm"
            leftIcon="delete"
            variant="secondary"
            onClick={() => {
              onDeleteOpen();
            }}
          >
            Slett
          </Button>
        </Flex>
      </Flex>
      <LastUpdated updated={updated} isComment />
      <DeleteCommentModal
        onOpen={onDeleteOpen}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        recordId={recordId}
        contextId={contextId}
      />
    </>
  );
}
