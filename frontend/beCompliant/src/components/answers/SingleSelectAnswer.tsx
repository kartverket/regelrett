import { Option } from '../../api/types';
import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Stack,
} from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import colorUtils from '../../utils/colorUtils';

type Props = {
  value: string | undefined;
  updated?: Date;
  choices?: string[] | null;
  options?: Option[] | null;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  answerExpiry: number | null;
  disabled?: boolean;
};

export function SingleSelectAnswer({
  updated,
  value,
  choices,
  options,
  setAnswerInput,
  submitAnswer,
  answerExpiry,
  disabled,
}: Props) {
  if (!choices)
    throw new Error(`Failed to fetch choices for single selection answer cell`);

  const selectedColor = options?.find((option) => option.name === value)?.color;

  const selectedAnswerBackgroundColor = selectedColor
    ? (colorUtils.getHexForColor(selectedColor) ?? 'white')
    : 'white';

  const choicesCollection = createListCollection({ items: choices });

  return (
    <Stack gap={1}>
      <SelectRoot
        deselectable
        aria-label="select"
        collection={choicesCollection}
        onValueChange={(e) => {
          const newAnswer: string = e.value[0];
          setAnswerInput(newAnswer);
          submitAnswer(newAnswer ?? '');
        }}
        value={value ? [value] : []}
        minW="170px"
        width="100%"
        background={selectedAnswerBackgroundColor}
        marginBottom={updated ? '0' : '6'}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValueText placeholder="Velg alternativ" />
        </SelectTrigger>
        <SelectContent>
          {choicesCollection.items.map((choice) => (
            <SelectItem item={choice} key={choice}>
              {choice}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      <LastUpdated
        updated={updated}
        submitAnswer={submitAnswer}
        value={value}
        answerExpiry={answerExpiry}
      />
    </Stack>
  );
}
