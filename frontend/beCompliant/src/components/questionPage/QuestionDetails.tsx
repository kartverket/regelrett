import { Text, Stack, StackProps, Box, Tag, Flex } from '@kvib/react';
import { Question } from '../../api/types';
import Markdown from 'react-markdown';
import { markdownComponents } from '../../utils/markdownComponents';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { useFetchColumns } from '../../hooks/useFetchColumns';
import colorUtils from '../../utils/colorUtils';
import { formatDateTime, isOlderThan } from '../../utils/formatTime';

type Props = StackProps & {
  question: Question;
  answerUpdated: Date;
  formId: string;
};

export function QuestionDetails({
  question,
  answerUpdated,
  formId,
  ...rest
}: Props) {
  const {
    data: columns,
    error: columnsError,
    isPending: columnsIsLoading,
  } = useFetchColumns(formId);

  if (columnsIsLoading) return <LoadingState />;
  if (columnsError)
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;

  const findFieldValue = (key: string) =>
    question.metadata.optionalFields?.find((field) => field.key === key)
      ?.value[0];

  const getColumnColor = (key: string) =>
    columns
      .find((column) => column.name === key)
      ?.options?.find((option) => option.name === findFieldValue(key))?.color;

  const description =
    findFieldValue('Sikkerhetskontroller') || findFieldValue('Beskrivelse');
  const name = findFieldValue('Kortnavn') || findFieldValue('Navn');

  return (
    <Stack gap="1" {...rest}>
      <Text>{question.id}</Text>
      <Text fontSize="2xl" fontWeight="bold">
        {name}
      </Text>
      <Box flexDirection="column" display="flex" gap="4" py="6">
        {question.metadata.optionalFields?.slice(3).map((field) => {
          const fieldValue = findFieldValue(field.key) || 'Ikke oppgitt';
          const fieldColor = getColumnColor(field.key) || 'grayLight1';
          const fieldBackgroundColorHex = colorUtils.getHexForColor(fieldColor);
          const fieldUseWhiteTextColor =
            colorUtils.shouldUseLightTextOnColor(fieldColor);

          return (
            <Flex key={field.key} alignItems="center" gap="4">
              <Text fontWeight="bold" minW="90px">
                {field.key}:
              </Text>
              <Tag
                backgroundColor={fieldBackgroundColorHex ?? 'white'}
                color={fieldUseWhiteTextColor ? 'white' : 'black'}
                width="fit-content"
                justifyContent="center"
              >
                {fieldValue}
              </Tag>
            </Flex>
          );
        })}
        <Flex alignItems="center" gap="4">
          <Text fontWeight="bold" minW="90px">
            Sist endret:
          </Text>
          <Text
            color={
              isOlderThan(
                answerUpdated,
                question.metadata.answerMetadata.expiry
              )
                ? 'red'
                : 'black'
            }
          >
            {formatDateTime(answerUpdated)}
          </Text>
        </Flex>
      </Box>
      <Box
        fontSize="md"
        whiteSpace="pre-line"
        backgroundColor="gray.200"
        p="4"
        borderRadius="6px"
      >
        <Text fontWeight="bold ">Beskrivelse:</Text>
        <Markdown components={markdownComponents}>{description}</Markdown>
      </Box>
    </Stack>
  );
}
