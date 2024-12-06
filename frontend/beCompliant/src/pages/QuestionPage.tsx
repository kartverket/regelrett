import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Flex, Button, useDisclosure } from '@kvib/react';
import { useFetchQuestion } from '../hooks/useFetchQuestion';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useFetchAnswersForQuestion } from '../hooks/useFetchAnswersForQuestion';
import { useFetchCommentsForQuestion } from '../hooks/useFetchCommentsForQuestion';
import { QuestionDetails } from '../components/questionPage/QuestionDetails';
import { QuestionAnswer } from '../components/questionPage/QuestionAnswer';
import { QuestionComment } from '../components/questionPage/QuestionComment';
import { QuestionInfoBox } from '../components/questionPage/QuestionInfoBox';
import { UnsavedChangesModal } from '../components/table/UnsavedChangesModal';
import { useState } from 'react';
import { QuestionHistory } from '../components/questionPage/QuestionHistory';
import { useFetchUserinfo } from '../hooks/useFetchUserinfo';
import { useFetchContext } from '../hooks/useFetchContext';

export const QuestionPage = () => {
  const { recordId, contextId } = useParams();

  const {
    data: context,
    error: contextError,
    isPending: contextIsLoading,
  } = useFetchContext(contextId);

  const {
    data: question,
    error: questionError,
    isPending: questionIsLoading,
  } = useFetchQuestion(context?.tableId, recordId);

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
  } = useFetchUserinfo();

  const {
    isOpen: isDiscardOpen,
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
    isCommentEditing ? onDiscardOpen() : handleDiscard();
  };

  if (!context.tableId || !recordId || !contextId) {
    return null;
  }

  return (
    <Flex direction="column" marginTop="10">
      <Button
        variant="tertiary"
        leftIcon="arrow_back"
        colorScheme="blue"
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
          marginBottom={{ base: '30', md: '20' }}
        />
        <Flex
          justifyContent="space-between"
          gap={{ base: '10', md: '6' }}
          flexDirection={{ base: 'column', md: 'row' }}
        >
          <QuestionAnswer
            question={question}
            answers={answers}
            contextId={contextId}
            user={userinfo.user}
            choices={question.metadata.answerMetadata.options}
            answerExpiry={question.metadata.answerMetadata.expiry}
          />
          <QuestionInfoBox question={question} tableId={context.tableId} />
        </Flex>
        <QuestionComment
          question={question}
          latestComment={comments.at(-1)?.comment ?? ''}
          contextId={contextId}
          isEditing={isCommentEditing}
          setIsEditing={setIsCommentEditing}
          marginTop={{ base: '10', md: '24' }}
          user={userinfo.user}
        />
        <QuestionHistory answers={answers} />
      </Flex>
    </Flex>
  );
};
