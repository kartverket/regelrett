import {
  Flex,
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupItemIndicator,
  RadioGroupItemText,
  RadioGroupItemHiddenInput,
  VStack,
} from '@kvib/react';
import { Question, User } from '../../api/types';
import { useSubmitAnswers } from '../../hooks/useAnswers';

type Props = {
  question: Question;
  latestAnswer: string;
  contextId: string;
  user: User;
};

export function RadioAnswer({
  question,
  latestAnswer,
  contextId,
  user,
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
      <RadioGroupRoot
        orientation="vertical"
        name="select-single-answer"
        defaultValue={latestAnswer}
      >
        <VStack align="start">
          {options?.map((option) => (
            <RadioGroupItem
              key={option}
              value={option}
              onChange={handleSelectionAnswer}
              colorPalette="blue"
            >
              <RadioGroupItemHiddenInput />
              <RadioGroupItemIndicator />
              <RadioGroupItemText>{option}</RadioGroupItemText>
            </RadioGroupItem>
          ))}
        </VStack>
      </RadioGroupRoot>
    </Flex>
  );
}
