import { useState } from 'react';
import { Answer, AnswerType, Question, User } from '../../api/types';
import { PercentAnswer } from '../answers/PercentAnswer';
import { RadioAnswer } from './RadioAnswer';
import { TextAreaAnswer } from './TextAreaAnswer';
import { Flex, Text } from '@kvib/react';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import { TimeAnswer } from '../answers/TimeAnswer';
import { CheckboxAnswer } from '../answers/CheckboxAnswer';

type Props = {
  question: Question;
  answers: Answer[];
  contextId: string;
  user: User;
  choices?: string[] | null;
  answerExpiry: number | null;
};

export function QuestionAnswer({
  question,
  answers,
  contextId,
  user,
  choices,
  answerExpiry,
}: Props) {
  const [answerInput, setAnswerInput] = useState<string | undefined>(
    answers.at(-1)?.answer
  );
  const [answerUnit, setAnswerUnit] = useState<string | undefined>(
    answers.at(-1)?.answerUnit
  );
  const { mutate: submitAnswerHook } = useSubmitAnswers(
    contextId,
    question.recordId
  );

  const submitAnswer = (newAnswer: string, unitAnswer?: string) => {
    submitAnswerHook({
      actor: user.id,
      recordId: question.recordId,
      questionId: question.id,
      answer: newAnswer,
      answerUnit: unitAnswer,
      answerType: question.metadata.answerMetadata.type,
      contextId: contextId,
    });
  };

  switch (question.metadata.answerMetadata.type) {
    case AnswerType.SELECT_SINGLE:
      return (
        <RadioAnswer
          question={question}
          latestAnswer={answers.at(-1)?.answer ?? ''}
          contextId={contextId}
          user={user}
          lastUpdated={answers.at(-1)?.updated}
          answerExpiry={answerExpiry}
        />
      );
    case AnswerType.TEXT_MULTI_LINE:
      return (
        <TextAreaAnswer
          question={question}
          latestAnswer={answers.at(-1)?.answer ?? ''}
          contextId={contextId}
          user={user}
          lastUpdated={answers.at(-1)?.updated}
          answerExpiry={answerExpiry}
        />
      );
    case AnswerType.PERCENT:
      return (
        <Flex flexDirection="column" gap="2" width="50%">
          <Text fontSize="lg" as="b">
            Svar
          </Text>
          <PercentAnswer
            value={answerInput}
            updated={answers.at(-1)?.updated}
            setAnswerInput={setAnswerInput}
            submitAnswer={submitAnswer}
            answerExpiry={answerExpiry}
          />
        </Flex>
      );
    case AnswerType.TIME:
      return (
        <Flex flexDirection="column" gap="2" width="50%">
          <Text fontSize="lg" as="b">
            Svar
          </Text>
          <TimeAnswer
            value={answerInput}
            updated={answers.at(-1)?.updated}
            setAnswerInput={setAnswerInput}
            submitAnswer={submitAnswer}
            setAnswerUnit={setAnswerUnit}
            unit={answerUnit}
            units={question.metadata.answerMetadata.units}
            answerExpiry={answerExpiry}
          />
        </Flex>
      );
    case AnswerType.CHECKBOX:
      return (
        <CheckboxAnswer
          value={answerInput}
          updated={answers.at(-1)?.updated}
          setAnswerInput={setAnswerInput}
          submitAnswer={submitAnswer}
          choices={choices}
          answerExpiry={answerExpiry}
        />
      );

    default:
      return <Text>Denne svartypen blir ikke støttet</Text>;
  }
}
