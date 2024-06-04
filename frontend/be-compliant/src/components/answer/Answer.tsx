import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Select } from '@kvib/react';
import { RecordType } from '../../pages/Table';

export type AnswerType = {
  questionId: string;
  answer: string;
  updated: string;
};

interface AnswerProps {
  choices: string[] | [];
  answer: string;
  record: RecordType;
  setFetchNewAnswers: Dispatch<SetStateAction<boolean>>;
  team?: string;
}

export const Answer = ({
  choices,
  answer,
  record,
  setFetchNewAnswers,
  team,
}: AnswerProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    answer
  );

  useEffect(() => {
    setSelectedAnswer(answer);
  }, [choices, answer]);

  const submitAnswer = async (answer: string, record: RecordType) => {
    const url = 'http://localhost:8080/answer'; // TODO: Place dev url to .env file
    const settings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actor: 'Unknown',
        questionId: record.fields.ID,
        question: record.fields.Aktivitiet,
        answer: answer,
        updated: '',
        team: team,
      }),
    };
    try {
      const response = await fetch(url, settings);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      setFetchNewAnswers(true);
    } catch (error) {
      console.error('There was an error with the submitAnswer request:', error);
    }
    return;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAnswer: string = e.target.value;
    setSelectedAnswer(newAnswer);
    submitAnswer(newAnswer, record);
  };

  return (
    <Select
      aria-label="select"
      placeholder="Velg alternativ"
      onChange={handleChange}
      value={selectedAnswer}
    >
      {choices.map((choice, index) => (
        <option value={choice} key={index}>
          {choice}
        </option>
      ))}
    </Select>
  );
};
