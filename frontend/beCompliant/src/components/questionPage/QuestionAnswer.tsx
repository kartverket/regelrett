import { Answer, AnswerType, Question } from '../../api/types';
import { RadioAnswer } from './RadioAnswer';
import { TextAreaAnswer } from './TextAreaAnswer';

type Props = {
  question: Question;
  answers: Answer[];
  team?: string;
  functionId?: number;
  isAnswerEdited: boolean;
  setIsAnswerEdited: (value: boolean) => void;
};

export function QuestionAnswer({
  question,
  answers,
  team,
  isAnswerEdited,
  setIsAnswerEdited,
  functionId,
}: Props) {
  switch (question.metadata.answerMetadata.type) {
    case AnswerType.SELECT_SINGLE:
      return (
        <RadioAnswer
          question={question}
          latestAnswer={answers.at(-1)?.answer ?? ''}
          team={team}
          functionId={functionId}
        />
      );
    case AnswerType.TEXT_MULTI_LINE:
      return (
        <TextAreaAnswer
          question={question}
          latestAnswer={answers.at(-1)?.answer ?? ''}
          team={team}
          functionId={functionId}
          isAnswerEdited={isAnswerEdited}
          setIsAnswerEdited={setIsAnswerEdited}
        />
      );

    default:
      return null;
  }
}
