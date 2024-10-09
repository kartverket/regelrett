import { Flex, IconButton, Text, Textarea, useDisclosure } from '@kvib/react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useSubmitComment } from '../../hooks/useSubmitComment';
import { DeleteCommentModal } from './DeleteCommentModal';
import { LastUpdated } from './LastUpdated';
import { useCommentState } from './TableState';

// Replace with type from api when the internal data model is implemented
type Props = {
  comment: string;
  recordId: string;
  questionId: string;
  updated?: Date;
  team: string | undefined;
};

export function Comment({
  comment,
  recordId,
  questionId,
  updated,
  team,
}: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { setEditedComment, setIsEditing, editedComment, isEditMode } =
    useCommentState(questionId);
  const [commentDeleted, setCommentDeleted] = useState(false);
  console.log(editedComment);

  const { mutate: submitComment, isPending: isLoading } =
    useSubmitComment(setIsEditing);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleCommentSubmit = () => {
    if (editedComment !== comment && editedComment != null) {
      submitComment({
        actor: 'Unknown',
        recordId: recordId,
        questionId: questionId,
        team: team,
        comment: editedComment ?? comment,
      });
    }
  };

  const handleDiscardChanges = () => {
    setEditedComment(comment);
    setIsEditing(false);
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
    console.log('editedComment: ', editedComment);
    console.log('comment: ', comment);
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
            onClick={handleCommentSubmit}
            isLoading={isLoading}
            isDisabled={editedComment === comment}
          />
          <IconButton
            aria-label="Slett kommentar"
            colorScheme="red"
            icon="close"
            variant="primary"
            onClick={handleDiscardChanges}
            isLoading={isLoading}
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
        onClick={() => setIsEditing(true)}
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
              setEditedComment(comment);
              setIsEditing(true);
            }}
            background="white"
          />
          <IconButton
            aria-label="Slett kommentar"
            colorScheme="red"
            icon="delete"
            variant="secondary"
            onClick={onDeleteOpen}
            background="white"
          />
        </Flex>
      </Flex>
      {updated && <LastUpdated updated={updated} />}
      <DeleteCommentModal
        onOpen={onDeleteOpen}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        comment={comment}
        questionId={questionId}
        recordId={recordId}
        team={team}
        setEditMode={setIsEditing}
        setCommentDeleted={setCommentDeleted}
      />
    </>
  );
}
