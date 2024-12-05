import { Checkbox, Stack } from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { LastUpdatedQuestionPage } from '../questionPage/LastUpdatedQuestionPage';

type Props = {
  value: string | undefined;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  choices?: string[] | null;
  isActivityPageView?: boolean;
};

export function CheckboxAnswer({
  value,
  updated,
  setAnswerInput,
  submitAnswer,
  choices,
  isActivityPageView = false,
}: Props) {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked
      ? (choices?.[0] ?? 'checked')
      : (choices?.[1] ?? 'unchecked');
    setAnswerInput(newValue);
    submitAnswer(newValue);
  };

  return (
    <Stack>
      <Checkbox
        colorScheme="blue"
        isChecked={value === (choices?.[0] ?? 'checked')}
        onChange={handleOnChange}
        size="md"
      >
        {choices?.length === 2 && value
          ? value === (choices?.[0] ?? 'checked')
            ? choices[0]
            : choices[1]
          : ''}
      </Checkbox>
      {isActivityPageView ? (
        <LastUpdated updated={updated} />
      ) : (
        <LastUpdatedQuestionPage lastUpdated={updated} />
      )}
    </Stack>
  );
}
