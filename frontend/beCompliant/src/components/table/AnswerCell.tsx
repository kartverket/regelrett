import { Button, Input, Select, Stack, Textarea } from '@kvib/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Answer, AnswerMetadata, AnswerType } from '../../api/types';
import { useSubmitAnswers } from '../../hooks/useSubmitAnswers';
import colorUtils from '../../utils/colorUtils';

type AnswerCellProps = Answer & AnswerMetadata;

export function AnswerCell({
  answer,
  question,
  questionId,
  options,
  type,
}: AnswerCellProps) {
  const params = useParams();
  const team = params.teamName;

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    answer
  );

  const { mutate: submitAnswer } = useSubmitAnswers();

  const handleInputAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSelectedAnswer(value);
  };

  const handleTextAreaAnswer = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setSelectedAnswer(value);
  };

  const submitTextAnswer = () => {
    submitAnswer({
      actor: 'Unknown',
      questionId: questionId,
      question: question,
      Svar: selectedAnswer ?? '',
      updated: '',
      team: team,
    });
  };

  const handleSelectionAnswer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAnswer: string = e.target.value;
    setSelectedAnswer(newAnswer);
    submitAnswer({
      actor: 'Unknown',
      questionId: questionId,
      question: question,
      Svar: newAnswer,
      updated: '',
      team: team,
    });
  };

  switch (type) {
    case AnswerType.TEXT_MULTI_LINE:
      return (
        <Stack spacing={2}>
          <Textarea value={selectedAnswer} onChange={handleTextAreaAnswer} />
          <Button onClick={submitTextAnswer}>Submit</Button>
        </Stack>
      );
    case AnswerType.SELECT_SINGLE:
      if (!options)
        throw new Error(
          `Failed to fetch choices for single selection answer cell`
        );
      const selectedChoice = options.find(
        (option) => option === selectedAnswer
      );
      const selectedAnswerBackgroundColor = selectedChoice
        ? colorUtils.getHexForColor(selectedChoice) ?? undefined
        : undefined;
      return (
        <Stack spacing={2}>
          <Select
            aria-label="select"
            placeholder="Velg alternativ"
            onChange={handleSelectionAnswer}
            value={selectedAnswer}
            width="170px"
            style={{ backgroundColor: selectedAnswerBackgroundColor }}
          >
            {options.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </Select>
        </Stack>
      );
  }

  return (
    <Stack spacing={2}>
      <Input value={selectedAnswer} onChange={handleInputAnswer} />
      <Button colorScheme={'blue'} onClick={submitTextAnswer}>
        Submit
      </Button>
    </Stack>
  );
}
