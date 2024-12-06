import { Text } from '@kvib/react';
import { useState } from 'react';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import { AnswerType, User } from '../../api/types';
import { Option } from '../../api/types';
import { PercentAnswer } from '../answers/PercentAnswer';
import { TimeAnswer } from '../answers/TimeAnswer';
import { TextAnswer } from '../answers/TextAnswer';
import { SingleSelectAnswer } from '../answers/SingleSelectAnswer';
import { CheckboxAnswer } from '../answers/CheckboxAnswer';

type Props = {
  value: any;
  answerType: AnswerType;
  unit?: string;
  units?: string[] | null;
  questionId: string;
  recordId: string;
  contextId: string;
  comment: string;
  updated?: Date;
  choices?: string[] | null;
  options?: Option[] | null;
  user: User;
  answerExpiry: number | null;
};

export function AnswerCell({
  value,
  answerType,
  unit,
  units,
  questionId,
  recordId,
  contextId,
  updated,
  choices,
  options,
  user,
  answerExpiry,
}: Props) {
  const [answerInput, setAnswerInput] = useState<string | undefined>(value);
  const [answerUnit, setAnswerUnit] = useState<string | undefined>(unit);

  const { mutate: submitAnswerHook } = useSubmitAnswers(contextId, recordId);

  const submitAnswer = (newAnswer: string, unitAnswer?: string) => {
    submitAnswerHook({
      actor: user.id,
      recordId: recordId,
      questionId: questionId,
      answer: newAnswer,
      answerUnit: unitAnswer,
      answerType: answerType,
      contextId: contextId,
    });
  };

  switch (answerType) {
    case AnswerType.TEXT_MULTI_LINE:
    case AnswerType.TEXT_SINGLE_LINE:
      return (
        <TextAnswer
          multipleLines={answerType === AnswerType.TEXT_MULTI_LINE}
          value={answerInput}
          updated={updated}
          setAnswerInput={setAnswerInput}
          submitAnswer={submitAnswer}
          answerExpiry={answerExpiry}
        />
      );
    case AnswerType.SELECT_SINGLE:
      return (
        <SingleSelectAnswer
          value={answerInput}
          updated={updated}
          choices={choices}
          options={options}
          setAnswerInput={setAnswerInput}
          submitAnswer={submitAnswer}
          answerExpiry={answerExpiry}
        />
      );
    case AnswerType.PERCENT:
      return (
        <PercentAnswer
          value={answerInput}
          updated={updated}
          setAnswerInput={setAnswerInput}
          submitAnswer={submitAnswer}
          isActivityPageView
          answerExpiry={answerExpiry}
        />
      );
    case AnswerType.TIME:
      return (
        <TimeAnswer
          value={answerInput}
          unit={answerUnit}
          units={units}
          updated={updated}
          setAnswerInput={setAnswerInput}
          setAnswerUnit={setAnswerUnit}
          submitAnswer={submitAnswer}
          isActivityPageView
          answerExpiry={answerExpiry}
        />
      );
    case AnswerType.CHECKBOX:
      return (
        <CheckboxAnswer
          value={answerInput}
          updated={updated}
          setAnswerInput={setAnswerInput}
          submitAnswer={submitAnswer}
          choices={choices}
          isActivityPageView
          answerExpiry={answerExpiry}
        />
      );
    default:
      return <Text>Ukjent svartype</Text>;
  }
}
