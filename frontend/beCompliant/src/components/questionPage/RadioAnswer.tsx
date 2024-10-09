import { Text, RadioGroup, Radio, Stack } from '@kvib/react';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import { Question } from '../../api/types';

type Props = {
  question: Question;
  latestAnswer: string;
  team?: string;
  functionId?: number;
};

export function RadioAnswer({
  question,
  latestAnswer,
  team,
  functionId,
}: Props) {
  const { mutate: submitAnswer } = useSubmitAnswers(team, functionId);
  const { type: answerType, options } = question.metadata.answerMetadata;

  const handleSelectionAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    submitAnswer({
      actor: 'Unknown',
      recordId: question.recordId ?? '',
      questionId: question.id,
      question: question.question,
      answer: e.target.value,
      team: team ?? null,
      functionId: functionId ?? null,
      answerType: answerType,
    });
  };

  return (
    <>
      <Text fontSize="lg" as="b">
        Svar
      </Text>
      <RadioGroup name="select-single-answer" defaultValue={latestAnswer}>
        <Stack direction="column">
          {options?.map((option) => (
            <Radio
              key={option}
              value={option}
              onChange={handleSelectionAnswer}
              colorScheme="blue"
            >
              {option}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
    </>
  );
}