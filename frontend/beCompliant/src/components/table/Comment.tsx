import { Flex, IconButton, Text, Textarea, useDisclosure } from '@kvib/react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useSubmitComment } from '../../hooks/useSubmitComment';
import { DeleteCommentModal } from './DeleteCommentModal';
import { LastUpdated } from './LastUpdated';
import { useCommentState } from './TableState';
import { User } from '../../api/types';

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
  const [commentDeleted, setCommentDeleted] = useState(false);

  const { mutate: submitComment, isPending: isLoading } = useSubmitComment(
    contextId,
    recordId,
    setIsEditing
  );
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleCommentSubmit = () => {
    if (editedComment !== comment && editedComment != null) {
      submitComment({
        actor: user.id,
        recordId: recordId,
        questionId: questionId,
        comment: editedComment ?? comment,
        contextId: contextId ?? null,
      });
    }
  };

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

    if (event.key === 'Enter' && event.shiftKey) {
      handleCommentSubmit();
    }
  };

  if (isEditMode) {
    return (
      <Flex minWidth="200px" gap="2" justifyContent="space-between">
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
        <Flex flexDirection="column" gap="2">
          <IconButton
            aria-label="Lagre kommentar"
            colorScheme="blue"
            icon="check"
            variant="primary"
            onClick={() => {
              handleCommentSubmit();
            }}
            isLoading={isLoading}
            isDisabled={editedComment === comment}
          />
          <IconButton
            aria-label="Slett kommentar"
            colorScheme="red"
            icon="close"
            variant="primary"
            onClick={() => {
              handleDiscardChanges();
            }}
            isDisabled={isLoading}
          />
        </Flex>
      </Flex>
    );
  }

  // change this when the new data model is implemented. Because this should not be an empty string
  if (comment === '' || commentDeleted) {
    return (
      <IconButton
        aria-label="Legg til kommentar"
        colorScheme="blue"
        icon="add_comment"
        variant="secondary"
        onClick={() => {
          setRowState(questionId, {
            comment: { editedComment: comment, isEditMode: true },
          });
        }}
        background="white"
        marginBottom={updated ? '0' : '6'}
      />
    );
  }
  return (
    <>
      <Flex
        minWidth="200px"
        alignItems="center"
        gap="2"
        justifyContent="space-between"
        marginBottom={updated ? '0' : '6'}
      >
        <Text
          maxWidth="328px"
          overflow="hidden"
          whiteSpace="normal"
          fontSize="md"
        >
          {comment}
        </Text>
        <Flex flexDirection="column" gap="2">
          <IconButton
            aria-label="Rediger kommentar"
            colorScheme="blue"
            icon="edit"
            variant="secondary"
            onClick={() => {
              setRowState(questionId, {
                comment: { editedComment: comment, isEditMode: true },
              });
            }}
            background="white"
          />
          <IconButton
            aria-label="Slett kommentar"
            colorScheme="red"
            icon="delete"
            variant="secondary"
            onClick={() => {
              onDeleteOpen();
            }}
            background="white"
          />
        </Flex>
      </Flex>
      <LastUpdated updated={updated} />
      <DeleteCommentModal
        onOpen={onDeleteOpen}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        comment={comment}
        questionId={questionId}
        recordId={recordId}
        contextId={contextId}
        setEditMode={setIsEditing}
        setCommentDeleted={setCommentDeleted}
        user={user}
      />
    </>
  );
}
