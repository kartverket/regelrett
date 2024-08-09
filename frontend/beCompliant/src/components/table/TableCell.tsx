import { Box, Flex, Tag } from '@kvib/react';
import { Row } from '@tanstack/react-table';
import { Field, Question } from '../../api/types';
import colorUtils from '../../utils/colorUtils';
import { AnswerCell } from './AnswerCell';

type TableCellProps = {
  value: any;
  column: Field;
  row: Row<Question>;
  answerable?: boolean;
};

export const TableCell = ({
  value,
  column,
  row,
  answerable = false,
}: TableCellProps) => {
  if (answerable) {
    return (
      <AnswerCell
        answer={row.original.answers[0]?.answer}
        type={row.original.metadata.answerMetadata.type}
        questionId={row.original.id}
        question={row.original.question}
        options={column.options}
        actor={row.original.answers[0]?.actor}
        team={row.original.answers[0]?.team}
        updated={row.original.answers[0]?.updated}
      />
    );
  }

  if (value == null) {
    return <></>;
  }
  const backgroundColor = column.options?.find(
    (choice: any) => choice.name === value
  );
  const backgroundColorHex = colorUtils.getHexForColor(
    backgroundColor ?? 'grayLight1'
  );
  const useWhiteTextColor = colorUtils.shouldUseLightTextOnColor(
    backgroundColor ?? 'grayLight1'
  );

  switch (column.type) {
    case 'OPTION_MULTIPLE': {
      const valueArray = value.split(',');
      return (
        <Flex flexWrap={'wrap'} gap={'1'}>
          {valueArray
            .sort((a: string, b: string) => a.length - b.length)
            .map((value: string, index: number) => {
              return (
                <Tag key={index} variant="solid">
                  {value}
                </Tag>
              );
            })}
        </Flex>
      );
    }
    case 'OPTION_SINGLE':
      return (
        <Tag
          colorScheme={undefined}
          backgroundColor={backgroundColorHex ?? 'white'}
          textColor={useWhiteTextColor ? 'white' : 'black'}
        >
          {value}
        </Tag>
      );
  }
  return <Box>{value}</Box>;
};
