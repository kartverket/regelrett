import { Textarea } from '@kvib/react';
import { Question, User } from '../../api/types';
import { useEffect, useState } from 'react';
import { useSubmitAnswers } from '../../hooks/useAnswers';

type Props = {
  question: Question;
  latestAnswer: string;
  contextId: string;
  user: User;
};

export function TextAreaAnswer({
  question,
  latestAnswer,
  contextId,
  user,
}: Props) {
  const [answerInput, setAnswerInput] = useState<string | undefined>(
    latestAnswer
  );
  const { mutate: submitAnswer } = useSubmitAnswers(
    contextId,
    question.recordId
  );

  useEffect(() => {
    setAnswerInput(latestAnswer);
  }, [latestAnswer]);

  return (
    <Textarea
      value={answerInput}
      onChange={(e) => setAnswerInput(e.target.value)}
      backgroundColor="white"
      resize="vertical"
      w="50%"
      onBlur={() => {
        if (answerInput !== latestAnswer) {
          submitAnswer({
            actor: user.id,
            recordId: question.recordId ?? '',
            questionId: question.id,
            answer: answerInput ?? '',
            answerType: question.metadata.answerMetadata.type,
            contextId: contextId,
          });
        }
      }}
    />
  );
}
