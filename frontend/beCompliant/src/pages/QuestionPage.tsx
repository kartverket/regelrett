import { useLocation, useNavigate, useParams } from 'react-router';
import { Flex, Button, useDisclosure, Box, Separator } from '@kvib/react';
import { useFetchQuestion } from '../hooks/useFetchQuestion';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { QuestionDetails } from '../components/questionPage/QuestionDetails';
import { QuestionAnswer } from '../components/questionPage/QuestionAnswer';
import { QuestionComment } from '../components/questionPage/QuestionComment';
import { UnsavedChangesModal } from '../components/table/UnsavedChangesModal';
import { useState } from 'react';
import { QuestionHistory } from '../components/questionPage/QuestionHistory';
import { useUser } from '../hooks/useUser';
import { useContext } from '../hooks/useContext';
import { useFetchCommentsForQuestion } from '../hooks/useComments';
import { useFetchAnswersForQuestion } from '../hooks/useAnswers';

export default function QuestionPage() {
  const { recordId, contextId } = useParams();

  const {
    data: context,
    error: contextError,
    isPending: contextIsLoading,
  } = useContext(contextId);

  const {
    data: question,
    error: questionError,
    isPending: questionIsLoading,
  } = useFetchQuestion(context?.formId, recordId);

  const {
    data: answers,
    error: answersError,
    isPending: answersIsLoading,
  } = useFetchAnswersForQuestion(contextId, recordId);

  const {
    data: comments,
    error: commentsError,
    isPending: commentsIsLoading,
  } = useFetchCommentsForQuestion(contextId, recordId);

  const {
    data: userinfo,
    error: userinfoError,
    isPending: userinfoIsLoading,
  } = useUser();

  const {
    open: isDiscardOpen,
    onOpen: onDiscardOpen,
    onClose: onDiscardClose,
  } = useDisclosure();

  const [isCommentEditing, setIsCommentEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (
    questionIsLoading ||
    answersIsLoading ||
    commentsIsLoading ||
    userinfoIsLoading ||
    contextIsLoading
  ) {
    return <LoadingState />;
  }

  if (
    questionError ||
    answersError ||
    commentsError ||
    userinfoError ||
    contextError
  ) {
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;
  }

  const handleDiscard = () => {
    navigate(
      location.pathname.substring(0, location.pathname.lastIndexOf('/')) || '/'
    );
  };

  const handleBackButton = () => {
    if (isCommentEditing) {
      onDiscardOpen();
    } else {
      handleDiscard();
    }
  };

  if (!context.formId || !recordId || !contextId) {
    return null;
  }

  return (
    <Flex direction="column" marginTop="10">
      <Button
        variant="tertiary"
        leftIcon="arrow_back"
        colorPalette="blue"
        alignSelf="start"
        marginLeft="2"
        onClick={handleBackButton}
      >
        Tilbake
      </Button>
      <UnsavedChangesModal
        onOpen={onDiscardOpen}
        onClose={onDiscardClose}
        isOpen={isDiscardOpen}
        onDiscard={handleDiscard}
      />
      <Flex
        alignSelf="center"
        flexDirection="column"
        gap="2"
        width={{ base: '100%', lg: '50%' }}
        padding={{ base: '10', lg: '0' }}
      >
        <QuestionDetails
          question={question}
          answerUpdated={answers.at(-1)?.updated ?? new Date()}
          formId={context.formId}
        />
        <Box py="10">
          <Separator borderColor="gray.200" />
        </Box>
        <QuestionAnswer
          question={question}
          answers={answers}
          contextId={contextId}
          user={userinfo.user}
          choices={question.metadata.answerMetadata.options}
          answerExpiry={question.metadata.answerMetadata.expiry}
        />
        <Box py="10">
          <Separator borderColor="gray.200" />
        </Box>
        <QuestionComment
          question={question}
          latestComment={comments.at(-1)?.comment ?? ''}
          contextId={contextId}
          isEditing={isCommentEditing}
          setIsEditing={setIsCommentEditing}
          user={userinfo.user}
        />
        <Box py="10">
          <Separator borderColor="gray.200" />
        </Box>
        <QuestionHistory answers={answers} />
      </Flex>
    </Flex>
  );
}
