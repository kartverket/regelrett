import { Stack, Text, Tooltip, Icon, Button } from '@kvib/react';
import { formatDateTime, isOlderThan } from '../../utils/formatTime';

type Props = {
  updated?: Date;
  submitAnswer?: (newAnswer: string, unit?: string) => void;
  value?: string | undefined;
  unitAnswer?: string;
  answerExpiry?: number | null;
  isComment?: boolean;
};

export function LastUpdated({
  updated,
  submitAnswer,
  value,
  unitAnswer,
  answerExpiry,
  isComment,
}: Props) {
  if (!updated) return null;

  return (
    <Stack
      color="gray"
      fontSize="xs"
      gap={1}
      direction="row"
      alignItems="center"
    >
      <Text fontWeight="bold" color="gray">
        Sist endret:
      </Text>
      {!isComment && isOlderThan(updated, answerExpiry) && (
        <Tooltip
          content="Svaret må oppdateres"
          aria-label="Svaret må oppdateres"
        >
          <Icon icon="warning" color="red" size={24} />
        </Tooltip>
      )}
      <Text
        fontWeight="medium"
        color={
          isOlderThan(updated, answerExpiry) && !isComment ? 'red' : 'gray'
        }
      >
        {formatDateTime(updated)}
      </Text>
      {!isComment && submitAnswer && (
        <Button
          aria-label="Forny svaret"
          rightIcon="autorenew"
          color="black"
          variant={'tertiary'}
          size="xs"
          onClick={() => {
            submitAnswer(value ?? '', unitAnswer);
          }}
        >
          Forny svar
        </Button>
      )}
    </Stack>
  );
}
