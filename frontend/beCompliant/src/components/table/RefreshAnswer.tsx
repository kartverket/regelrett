import { Flex, Text, Icon } from '@kvib/react';

type Props = {
  updated?: Date;
  answerExpiry: number | null;
  submitAnswer: (newAnswer: string, unit?: string) => void;
  value: string | undefined;
  unitAnswer?: string;
};

export function RefreshAnswer({
  updated,
  answerExpiry,
  submitAnswer,
  value,
  unitAnswer,
}: Props) {
  const isOlderThan = (updated: Date, weeks?: number | null): boolean => {
    const currentDate = new Date();
    const millisecondsInAWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    const threshold = weeks
      ? weeks * millisecondsInAWeek
      : 30 * 24 * 60 * 60 * 1000; // Use weeks or default to 30 days
    return currentDate.getTime() - updated.getTime() > threshold;
  };

  return (
    <>
      {updated && isOlderThan(updated, answerExpiry) && (
        <Flex
          alignItems="center"
          onClick={(e) => {
            e.stopPropagation();
            submitAnswer(value ?? '', unitAnswer);
          }}
        >
          <Text fontSize="xs" cursor="pointer" textDecoration="underline">
            Dette svaret gjelder fortsatt
          </Text>
          <Icon icon="refresh" />
        </Flex>
      )}
    </>
  );
}
