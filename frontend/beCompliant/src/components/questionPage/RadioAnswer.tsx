import { Text, RadioGroup, Radio, Stack, Flex } from '@kvib/react';
import { Question, User } from '../../api/types';
import { LastUpdated } from '../table/LastUpdated';
import { useSubmitAnswers } from '../../hooks/useAnswers';

type Props = {
  question: Question;
  latestAnswer: string;
  contextId: string;
  user: User;
  lastUpdated?: Date;
  answerExpiry: number | null;
};

export function RadioAnswer({
  question,
  latestAnswer,
  contextId,
  user,
  lastUpdated,
  answerExpiry,
}: Props) {
  const { mutate: submitAnswer } = useSubmitAnswers(
    contextId,
    question.recordId
  );
  const { type: answerType, options } = question.metadata.answerMetadata;

  const handleSelectionAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    submitRadioAnswer(e.target.value);
  };

  const submitRadioAnswer = (answer: string) => {
    submitAnswer({
      actor: user.id,
      recordId: question.recordId ?? '',
      questionId: question.id,
      answer: answer,
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
      <LastUpdated
        updated={lastUpdated}
        answerExpiry={answerExpiry}
        submitAnswer={submitRadioAnswer}
        value={latestAnswer}
      />
    </Flex>
  );
}
