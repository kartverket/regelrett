import { Text, RadioGroup, Radio, Stack, Flex } from '@kvib/react';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import { Question } from '../../api/types';

type Props = {
  question: Question;
  latestAnswer: string;
  tableId: string;
  contextId: string;
};

export function RadioAnswer({
  question,
  latestAnswer,
  tableId,
  contextId,
}: Props) {
  const { mutate: submitAnswer } = useSubmitAnswers(tableId, contextId);
  const { type: answerType, options } = question.metadata.answerMetadata;

  const handleSelectionAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    submitAnswer({
      actor: 'Unknown',
      recordId: question.recordId ?? '',
      questionId: question.id,
      question: question.question,
      answer: e.target.value,
      tableId: tableId,
      answerType: answerType,
      contextId: contextId,
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
