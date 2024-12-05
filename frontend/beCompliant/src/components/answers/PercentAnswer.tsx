import {
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Stack,
} from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { useRef } from 'react';
import { LastUpdatedQuestionPage } from '../questionPage/LastUpdatedQuestionPage';

type Props = {
  value: string | undefined;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  isActivityPageView?: boolean;
};

export function PercentAnswer({
  value,
  updated,
  setAnswerInput,
  submitAnswer,
  isActivityPageView = false,
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
    <Stack spacing={1} direction="column">
      <Stack spacing={2} direction="row">
        <InputGroup width="fit-content">
          <NumberInput value={value} background={'white'} borderRadius="5px">
            <NumberInputField
              onChange={handlePercentAnswer}
              type="number"
              borderRight={'none'}
              borderRightRadius={0}
              onBlur={() => {
                if (value != initialValue) {
                  submitAnswer(value ?? '');
                }
              }}
            />
          </NumberInput>
          <InputRightAddon
            children={'%'}
            background={'white'}
            borderLeft={'none'}
            backgroundColor={'#E3E0E0'}
            width={4}
            border="1px solid"
            borderColor="gray.400"
            display="flex"
            justifyContent="center"
            color="gray.500"
          />
        </InputGroup>
      </Stack>
      {isActivityPageView ? (
        <LastUpdated updated={updated} />
      ) : (
        <LastUpdatedQuestionPage lastUpdated={updated} />
      )}
    </Stack>
  );
}
