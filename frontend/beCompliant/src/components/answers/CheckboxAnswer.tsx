import { Checkbox, Stack } from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';

type Props = {
  value: string | undefined;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  choices?: string[] | null;
  isActivityPageView?: boolean;
  answerExpiry: number | null;
  disabled?: boolean;
};

export function CheckboxAnswer({
  value,
  updated,
  setAnswerInput,
  submitAnswer,
  choices,
  isActivityPageView = false,
  answerExpiry,
  disabled,
}: Props) {
  return (
    <Stack>
      <Checkbox
        colorPalette="blue"
        checked={value === (choices?.[0] ?? 'checked')}
        onCheckedChange={(e) => {
          const newValue = e.checked
            ? (choices?.[0] ?? 'checked')
            : (choices?.[1] ?? 'unchecked');
          setAnswerInput(newValue);
          submitAnswer(newValue);
        }}
        size="md"
        disabled={disabled}
      >
        {choices?.length === 2 && value
          ? value === (choices?.[0] ?? 'checked')
            ? choices[0]
            : choices[1]
          : ''}
      </Checkbox>
      {isActivityPageView && (
        <LastUpdated
          updated={updated}
          answerExpiry={answerExpiry}
          submitAnswer={submitAnswer}
          value={value}
        />
      )}
    </Stack>
  );
}
