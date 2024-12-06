import {
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
} from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { useEffect, useRef } from 'react';
import { LastUpdatedQuestionPage } from '../questionPage/LastUpdatedQuestionPage';
import { RefreshAnswer } from '../table/RefreshAnswer';

type Props = {
  value: string | undefined;
  unit?: string;
  units?: string[] | null;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAnswerUnit: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string, unit?: string) => void;
  isActivityPageView?: boolean;
  answerExpiry: number | null;
};

export function TimeAnswer({
  updated,
  value,
  unit,
  units,
  setAnswerInput,
  setAnswerUnit,
  submitAnswer,
  isActivityPageView = false,
  answerExpiry,
}: Props) {
  const initialValue = useRef(value).current;
  const initialUnit = useRef(unit).current;

  useEffect(() => {
    if (!unit && units && units.length > 0) {
      setAnswerUnit(units[0]);
    }
  }, [unit, units, setAnswerUnit]);

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
    if (value) {
      submitAnswer(value, timeUnit);
    }
  };

  return (
    <Stack spacing={1} direction="column">
      <Stack spacing={2} direction="row" alignItems="center">
        <InputGroup width="fit-content">
          <NumberInput background={'white'} borderRadius="5px" value={value}>
            <NumberInputField
              onChange={handleTimeAnswerValue}
              onClick={(e) => e.stopPropagation()}
              type="number"
              onBlur={() => {
                if (value != initialValue || unit != initialUnit) {
                  submitAnswer(value ?? '', unit);
                }
              }}
            />
            <InputRightElement width="4.5rem">
              <Select
                height="10"
                background="white"
                value={unit ?? units?.[0]}
                onChange={handleTimeAnswerUnit}
                onClick={(e) => e.stopPropagation()}
                size="sm"
                borderRightRadius="md"
              >
                {units?.map((u) => (
                  <option value={u} key={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </InputRightElement>
          </NumberInput>
        </InputGroup>
      </Stack>
      <RefreshAnswer
        updated={updated}
        answerExpiry={answerExpiry}
        submitAnswer={submitAnswer}
        value={value}
        unitAnswer={unit}
      />
      {isActivityPageView ? (
        <LastUpdated updated={updated} />
      ) : (
        <LastUpdatedQuestionPage lastUpdated={updated} />
      )}
    </Stack>
  );
}
