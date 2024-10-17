import {
  IconButton,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
} from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { useEffect } from 'react';

type Props = {
  value: string | undefined;
  unit?: string;
  choices?: string[] | null;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAnswerUnit: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string, unit?: string) => void;
  showLastUpdated?: boolean;
};

export function TimeAnswer({
  updated,
  value,
  unit,
  choices,
  setAnswerInput,
  setAnswerUnit,
  submitAnswer,
  showLastUpdated = false,
}: Props) {
  useEffect(() => {
    if (!unit && choices && choices.length > 0) {
      setAnswerUnit(choices[0]);
    }
  }, [unit, choices, setAnswerUnit]);

  const handleTimeAnswerValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0 && value.length <= 4) {
      setAnswerInput(value);
    }
  };

  const handleTimeAnswerUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeUnit = e.target.value;
    setAnswerUnit(timeUnit);
  };

  return (
    <Stack spacing={1} direction="column">
      <Stack spacing={2} direction="row" alignItems="center">
        <InputGroup width="fit-content">
          <NumberInput background={'white'} borderRadius="5px" value={value}>
            <NumberInputField onChange={handleTimeAnswerValue} type="number" />
            <InputRightElement width="4.5rem">
              <Select
                height="10"
                background="white"
                value={unit ?? choices?.[0]}
                onChange={handleTimeAnswerUnit}
                size="sm"
                borderRightRadius="md"
              >
                {choices?.map((choice) => (
                  <option value={choice} key={choice}>
                    {choice}
                  </option>
                ))}
              </Select>
            </InputRightElement>
          </NumberInput>
        </InputGroup>
        <IconButton
          aria-label={'Lagre tidssvar'}
          icon="check"
          colorScheme="blue"
          variant="secondary"
          onClick={() => submitAnswer(value ?? '', unit)}
          background="white"
        >
          Submit
        </IconButton>
      </Stack>
      {showLastUpdated && <LastUpdated updated={updated} />}
    </Stack>
  );
}
