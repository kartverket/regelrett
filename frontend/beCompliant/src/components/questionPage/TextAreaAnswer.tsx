import { Text, Textarea, Stack, Button } from '@kvib/react';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import { Question } from '../../api/types';
import { useEffect, useState } from 'react';

type Props = {
  question: Question;
  latestAnswer: string;
  team?: string;
  functionId?: number;
};

export function TextAreaAnswer({
  question,
  latestAnswer,
  team,
  functionId,
}: Props) {
  const [answerInput, setAnswerInput] = useState<string | undefined>(
    latestAnswer
  );
  const { mutate: submitAnswer, isPending: isLoading } = useSubmitAnswers(team);
  const submitTextAnswer = () => {
    if (answerInput !== latestAnswer) {
      submitAnswer({
        actor: 'Unknown',
        recordId: question.recordId ?? '',
        questionId: question.id,
        question: question.question,
        answer: answerInput ?? '',
        team: team ?? null,
        functionId: functionId ?? null,
        answerType: question.metadata.answerMetadata.type,
      });
    }
  };

  useEffect(() => {
    setAnswerInput(latestAnswer);
  }, [latestAnswer]);

  return (
    <>
      <Text fontSize="lg" as="b">
        Svar
      </Text>
      <Stack spacing="2" direction="column">
        <Textarea
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          background="white"
          resize="vertical"
          width="50%"
        />
        <Button
          aria-label="Lagre svar"
          colorScheme="blue"
          leftIcon="check"
          variant="secondary"
          onClick={submitTextAnswer}
          isLoading={isLoading}
          isDisabled={answerInput === latestAnswer}
          width="fit-content"
        >
          Lagre svar
        </Button>
      </Stack>
    </>
  );
}