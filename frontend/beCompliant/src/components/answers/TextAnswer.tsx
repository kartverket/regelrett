import { Input, Stack, Textarea } from '@kvib/react';
import { LastUpdated } from '../LastUpdated';
import { useRef } from 'react';

type Props = {
  value: string | undefined;
  updated?: Date;
  multipleLines?: boolean;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  answerExpiry: number | null;
  disabled?: boolean;
};

export function TextAnswer({
  value,
  updated,
  multipleLines,
  setAnswerInput,
  submitAnswer,
  answerExpiry,
  disabled,
}: Props) {
  const initialValue = useRef(value).current;

  return (
    <Stack gap={1} direction="column">
      <Stack gap={2} direction="row" alignItems="center">
        {multipleLines ? (
          <Textarea
            value={value}
            onChange={(e) => setAnswerInput(e.target.value)}
            backgroundColor="white"
            onBlur={() => {
              if (value != initialValue) {
                submitAnswer(value ?? '');
              }
            }}
            disabled={disabled}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setAnswerInput(e.target.value)}
            backgroundColor="white"
            onBlur={() => {
              if (value != initialValue) {
                submitAnswer(value ?? '');
              }
            }}
            disabled={disabled}
          />
        )}
      </Stack>
      <LastUpdated
        updated={updated}
        answerExpiry={answerExpiry}
        submitAnswer={submitAnswer}
        value={value}
      />
    </Stack>
  );
}
