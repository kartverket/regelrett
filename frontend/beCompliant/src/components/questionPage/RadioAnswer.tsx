import { Text, RadioGroup, Radio, Stack, Flex } from '@kvib/react';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import { Question, User } from '../../api/types';

type Props = {
  question: Question;
  latestAnswer: string;
  team?: string;
  functionId?: number;
  tableId: string;
  contextId?: string;
  user: User;
};

export function RadioAnswer({
  question,
  latestAnswer,
  team,
  functionId,
  tableId,
  contextId,
  user,
}: Props) {
  const { mutate: submitAnswer } = useSubmitAnswers(
    tableId,
    team,
    functionId,
    contextId
  );
  const { type: answerType, options } = question.metadata.answerMetadata;

  const handleSelectionAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    submitAnswer({
      actor: user.id,
      recordId: question.recordId ?? '',
      questionId: question.id,
      question: question.question,
      answer: e.target.value,
      team: team ?? null,
      functionId: functionId ?? null,
      tableId: tableId,
      answerType: answerType,
      contextId: contextId ?? null,
    });
  };

  return (
    <Flex flexDirection="column" gap="2">
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
    </Flex>
  );
}
