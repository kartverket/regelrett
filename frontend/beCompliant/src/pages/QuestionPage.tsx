import { useNavigate, useParams } from 'react-router-dom';
import { Flex, Button, useDisclosure } from '@kvib/react';
import { useFetchQuestion } from '../hooks/useFetchQuestion';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useFetchAnswersForQuestion } from '../hooks/useFetchAnswersForQuestion';
import { useFetchCommentsForQuestionByTeam } from '../hooks/useFetchCommentsForQuestion';
import { QuestionDetails } from '../components/questionPage/QuestionDetails';
import { QuestionAnswer } from '../components/questionPage/QuestionAnswer';
import { QuestionComment } from '../components/questionPage/QuestionComment';
import { QuestionInfoBox } from '../components/questionPage/QuestionInfoBox';
import { UnsavedChangesModal } from '../components/table/UnsavedChangesModal';
import { useState } from 'react';
import { QuestionHistory } from '../components/questionPage/QuestionHistory';
import { useFetchCurrentUser } from '../hooks/useFetchCurrentUser';

export const QuestionPage = () => {
  const { teamId, recordId, tableId, contextId, ...params } = useParams();

  if (!tableId) return null;

  const functionId = params.functionId
    ? Number.parseInt(params.functionId)
    : undefined;

  const {
    data: question,
    error: questionError,
    isPending: questionIsLoading,
  } = useFetchQuestion(tableId, recordId);

  const {
    data: answers,
    error: answersError,
    isPending: answersIsLoading,
  } = useFetchAnswersForQuestion(
    teamId,
    functionId,
    tableId,
    recordId,
    contextId
  );

  const {
    data: comments,
    error: commentsError,
    isPending: commentsIsLoading,
  } = useFetchCommentsForQuestionByTeam(
    teamId,
    functionId,
    tableId,
    recordId,
    contextId
  );

  const {
    data: user,
    error: userError,
    isPending: userIsLoading,
  } = useFetchCurrentUser();

  const {
    isOpen: isDiscardOpen,
    onOpen: onDiscardOpen,
    onClose: onDiscardClose,
  } = useDisclosure();

  const [isCommentEditing, setIsCommentEditing] = useState(false);
  const [isAnswerEdited, setIsAnswerEdited] = useState(false);
  const navigate = useNavigate();

  if (
    questionIsLoading ||
    answersIsLoading ||
    commentsIsLoading ||
    userIsLoading
  ) {
    return <LoadingState />;
  }

  if (questionError || answersError || commentsError || userError) {
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;
  }

  const handleDiscard = () => {
    navigate(`/team/${teamId}`);
  };

  const handleBackButton = () => {
    isCommentEditing || isAnswerEdited ? onDiscardOpen() : handleDiscard();
  };

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
          marginBottom={{ base: '30', md: '120' }}
        />
        <Flex
          justifyContent="space-between"
          gap={{ base: '10', md: '6' }}
          flexDirection={{ base: 'column', md: 'row' }}
        >
          <QuestionAnswer
            question={question}
            answers={answers}
            team={teamId}
            functionId={functionId}
            tableId={tableId}
            isAnswerEdited={isAnswerEdited}
            setIsAnswerEdited={setIsAnswerEdited}
            contextId={contextId}
            user={user}
          />
          <QuestionInfoBox question={question} tableId={tableId} />
        </Flex>
        <QuestionComment
          question={question}
          latestComment={comments.at(-1)?.comment ?? ''}
          team={teamId}
          functionId={functionId}
          tableId={tableId}
          contextId={contextId}
          isEditing={isCommentEditing}
          setIsEditing={setIsCommentEditing}
          marginTop={{ base: '10', md: '24' }}
          user={user}
        />
        <QuestionHistory answers={answers} />
      </Flex>
    </Flex>
  );
};
