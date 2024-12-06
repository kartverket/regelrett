import { Flex, Tag, Box } from '@kvib/react';
import { Row } from '@tanstack/react-table';
import { AnswerCell } from './AnswerCell';
import { Column, OptionalFieldType, Question, User } from '../../api/types';
import colorUtils from '../../utils/colorUtils';
import Markdown from 'react-markdown';
import { markdownComponents } from '../../utils/markdownComponents';

type Props = {
  contextId: string;
  value: any;
  column: Column;
  row: Row<Question>;
  answerable?: boolean;
  user: User;
};

export const TableCell = ({
  contextId,
  value,
  column,
  row,
  answerable = false,
  user,
}: Props) => {
  if (answerable) {
    return (
      <AnswerCell
        value={row.original.answers.at(-1)?.answer}
        answerType={row.original.metadata?.answerMetadata.type}
        unit={row.original.answers.at(-1)?.answerUnit}
        units={row.original.metadata?.answerMetadata.units}
        recordId={row.original.recordId}
        contextId={contextId}
        questionId={row.original.id}
        comment={row.original.comments?.at(0)?.comment ?? ''}
        updated={row.original.answers.at(-1)?.updated}
        choices={row.original.metadata?.answerMetadata.options}
        options={column.options}
        user={user}
        answerExpiry={row.original.metadata?.answerMetadata.expiry}
      />
    );
  }

  if (value == null) {
    return <></>;
  }

  switch (value.type) {
    case OptionalFieldType.OPTION_MULTIPLE: {
      const valueArray = value.value;
      return (
        <Flex flexWrap="wrap" gap="1">
          {valueArray
            .sort((a: string, b: string) => a.length - b.length)
            .map((text: string, index: number) => {
              return (
                <Tag key={index} variant="solid">
                  {text}
                </Tag>
              );
            })}
        </Flex>
      );
    }
    case OptionalFieldType.OPTION_SINGLE:
      const backgroundColor = column.options?.find(
        (option) => option.name === value.value[0]
      )?.color;

      const backgroundColorHex = colorUtils.getHexForColor(
        backgroundColor ?? 'grayLight1'
      );
      const useWhiteTextColor = colorUtils.shouldUseLightTextOnColor(
        backgroundColor ?? 'grayLight1'
      );

      return (
        <Tag
          backgroundColor={backgroundColorHex ?? 'white'}
          textColor={useWhiteTextColor ? 'white' : 'black'}
        >
          {value.value}
        </Tag>
      );
  }
  return (
    <Box whiteSpace="normal" fontSize="md" maxW="500px">
      <Markdown components={markdownComponents}>
        {value.value[0].split('\n\n')[0]}
      </Markdown>
    </Box>
  );
};
