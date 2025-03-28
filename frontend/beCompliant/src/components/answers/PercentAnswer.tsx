import { Input, InputGroup, Stack } from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { useRef } from 'react';

type Props = {
  value: string | undefined;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  isActivityPageView?: boolean;
  answerExpiry: number | null;
  disabled?: boolean;
};

export function PercentAnswer({
  value,
  updated,
  setAnswerInput,
  submitAnswer,
  isActivityPageView = false,
  answerExpiry,
  disabled,
}: Props) {
  const initialValue = useRef(value).current;

  const handlePercentAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = Number(value);
    if (
      !isNaN(numericValue) &&
      numericValue >= 0 &&
      numericValue <= 100 &&
      value.length <= 7
    ) {
      setAnswerInput(value);
    }
  };

  return (
    <Stack gap={1} direction="column">
      <Stack gap={2} direction="row">
        <InputGroup width="fit-content" endElement="%">
          <Input
            flex="1"
            value={value}
            background={'white'}
            onChange={handlePercentAnswer}
            onBlur={() => {
              if (value != initialValue) {
                submitAnswer(value ?? '');
              }
            }}
            disabled={disabled}
          />
        </InputGroup>
      </Stack>
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
