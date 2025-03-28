import {
  createListCollection,
  Input,
  InputGroup,
  KvibNativeSelect,
  Stack,
} from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { useEffect, useRef } from 'react';

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
  disabled?: boolean;
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
  disabled,
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

  const unitCollection = createListCollection({
    items: units ?? [],
  });

  const UnitSelect = () => {
    return (
      <KvibNativeSelect.Root
        size="sm"
        marginEnd="-1"
        width="auto"
        variant="plain"
        disabled={disabled}
      >
        <KvibNativeSelect.Field
          value={unit ?? units?.[0]}
          onChange={(e) => {
            setAnswerUnit(e.target.value);
            if (value) {
              submitAnswer(value, e.target.value);
            }
          }}
        >
          {unitCollection.items.map((u) => (
            <option value={u} key={u}>
              {u}
            </option>
          ))}
        </KvibNativeSelect.Field>
        <KvibNativeSelect.Indicator />
      </KvibNativeSelect.Root>
    );
  };

  return (
    <Stack gap={1} direction="column">
      <InputGroup width="fit-content" endElement={<UnitSelect />}>
        <Input
          onChange={handleTimeAnswerValue}
          backgroundColor="white"
          value={value}
          onBlur={() => {
            if (value != initialValue || unit != initialUnit) {
              submitAnswer(value ?? '', unit);
            }
          }}
          disabled={disabled}
        ></Input>
      </InputGroup>
      {isActivityPageView && (
        <LastUpdated
          updated={updated}
          answerExpiry={answerExpiry}
          submitAnswer={submitAnswer}
          value={value}
          unitAnswer={unit}
        />
      )}
    </Stack>
  );
}
