import { useState } from 'react';
import { Answer, AnswerType, Question, User } from '../../api/types';
import { PercentAnswer } from '../answers/PercentAnswer';
import { RadioAnswer } from './RadioAnswer';
import { TextAreaAnswer } from './TextAreaAnswer';
import { Flex, Text, Button } from '@kvib/react';
import { TimeAnswer } from '../answers/TimeAnswer';
import { CheckboxAnswer } from '../answers/CheckboxAnswer';
import { useSubmitAnswers } from '../../hooks/useAnswers';

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

  return (
    <Flex flexDirection="column" gap="2">
      <Text fontSize="lg" fontWeight="bold">
        Svar
      </Text>
      {(() => {
        switch (question.metadata.answerMetadata.type) {
          case AnswerType.SELECT_SINGLE:
            return (
              <RadioAnswer
                question={question}
                latestAnswer={answers.at(-1)?.answer ?? ''}
                contextId={contextId}
                user={user}
              />
            );
          case AnswerType.TEXT_MULTI_LINE:
            return (
              <TextAreaAnswer
                question={question}
                latestAnswer={answers.at(-1)?.answer ?? ''}
                contextId={contextId}
                user={user}
              />
            );
          case AnswerType.PERCENT:
            return (
              <PercentAnswer
                value={answerInput}
                updated={answers.at(-1)?.updated}
                setAnswerInput={setAnswerInput}
                submitAnswer={submitAnswer}
                answerExpiry={answerExpiry}
              />
            );
          case AnswerType.TIME:
            return (
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
      })()}
      {answers.length > 0 && (
        <Button
          aria-label="Forny svaret"
          rightIcon="autorenew"
          color="black"
          variant={'tertiary'}
          size="xs"
          alignSelf="start"
          p="0"
          onClick={() => {
            submitAnswer(
              answers.at(-1)?.answer ?? '',
              answers.at(-1)?.answerUnit
            );
          }}
        >
          Forny svar
        </Button>
      )}
    </Flex>
  );
}
