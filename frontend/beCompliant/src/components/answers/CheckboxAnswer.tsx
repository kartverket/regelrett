import { Checkbox, Stack } from '@kvib/react';
import { LastUpdated } from '../table/LastUpdated';
import { LastUpdatedQuestionPage } from '../questionPage/LastUpdatedQuestionPage';
import { RefreshAnswer } from '../table/RefreshAnswer';

type Props = {
  value: string | undefined;
  updated?: Date;
  setAnswerInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  submitAnswer: (newAnswer: string) => void;
  choices?: string[] | null;
  isActivityPageView?: boolean;
  answerExpiry: number | null;
};

export function CheckboxAnswer({
  value,
  updated,
  setAnswerInput,
  submitAnswer,
  choices,
  isActivityPageView = false,
  answerExpiry,
}: Props) {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked
      ? (choices?.[0] ?? 'checked')
      : (choices?.[1] ?? 'unchecked');
    setAnswerInput(newValue);
    submitAnswer(newValue);
  };

  return (
    <Stack onClick={(e) => e.stopPropagation()}>
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
      <RefreshAnswer
        updated={updated}
        answerExpiry={answerExpiry}
        submitAnswer={submitAnswer}
        value={value}
      />
      {isActivityPageView ? (
        <LastUpdated updated={updated} />
      ) : (
        <LastUpdatedQuestionPage lastUpdated={updated} />
      )}
    </Stack>
  );
}
