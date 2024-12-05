import { Option } from '../../api/types';
import { Select, Stack } from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import colorUtils from '../../utils/colorUtils';

type Props = {
  value: string | undefined;
  updated?: Date;
  choices?: string[] | null;
  options?: Option[] | null;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
};

export function SingleSelectAnswer({
  updated,
  value,
  choices,
  options,
  setAnswerInput,
  submitAnswer,
}: Props) {
  const handleSelectionAnswer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAnswer: string = e.target.value;
    setAnswerInput(newAnswer);
    submitAnswer(newAnswer ?? '');
  };

  if (!choices)
    throw new Error(`Failed to fetch choices for single selection answer cell`);

  const selectedColor = options?.find((option) => option.name === value)?.color;

  const selectedAnswerBackgroundColor = selectedColor
    ? (colorUtils.getHexForColor(selectedColor) ?? 'white')
    : 'white';

  return (
    <Stack spacing={1}>
      <Select
        aria-label="select"
        placeholder="Velg alternativ"
        onChange={handleSelectionAnswer}
        value={value}
        minW="170px"
        width="100%"
        background={selectedAnswerBackgroundColor}
        marginBottom={updated ? '0' : '6'}
      >
        {choices.map((choice) => (
          <option value={choice} key={choice}>
            {choice}
          </option>
        ))}
      </Select>
      <LastUpdated updated={updated} />
    </Stack>
  );
}
