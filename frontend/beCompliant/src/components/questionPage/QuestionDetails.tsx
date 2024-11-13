import { Text, Stack, StackProps } from '@kvib/react';
import { Question } from '../../api/types';

type Props = StackProps & {
  question: Question;
  answerUpdated: Date;
};

export function QuestionDetails({ question, answerUpdated, ...rest }: Props) {
  const findFieldValue = (key: string) =>
    question.metadata.optionalFields?.find((field) => field.key === key)
      ?.value[0];

  const description =
    findFieldValue('Sikkerhetskontroller') || findFieldValue('Beskrivelse');
  const name = findFieldValue('Kortnavn') || findFieldValue('Navn');

  return (
    <Stack gap="1" {...rest}>
      <Text>{question.id}</Text>
      <Text fontSize="lg" as="b">
        {name}
      </Text>
      <Text fontSize="md" whiteSpace="pre-line" maxW="600px">
        {description}
      </Text>
    </Stack>
  );
}
