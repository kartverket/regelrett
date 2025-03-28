import {
  Separator,
  Flex,
  HStack,
  Icon,
  Text,
  KvibSteps,
  Box,
  Stack,
  Grid,
} from '@kvib/react';
import { Answer } from '../../api/types';
import { formatDateTime } from '../../utils/formatTime';

import { useFetchUsername } from '../../hooks/useUser';

type Props = {
  answers: Answer[];
};

export function QuestionHistory({ answers }: Props) {
  const steps = answers.slice(-3).reverse();

  return (
    <Flex flexDirection="column" pb="5rem">
      <HStack marginBottom="4">
        <Icon icon="schedule" size={26} />
        <Text fontWeight="bold" fontSize="lg">
          Historikk
        </Text>
      </HStack>
      {steps.length === 0 ? (
        <Text>Ingen historikk finnes</Text>
      ) : (
        <Flex flexDirection="column" gap="3" alignItems="center">
          <Grid templateColumns="3rem 1fr 1fr 1fr" width="100%">
            <Text gridColumnStart="2">NÅR</Text>
            <Text>SVAR</Text>
            <Text>HVEM</Text>
          </Grid>
          <KvibSteps.Root
            variant="solid"
            step={0}
            orientation="vertical"
            minHeight="300px"
            gap="0"
            width="100%"
          >
            <KvibSteps.List width="100%">
              {steps.map((answer, index) => (
                <QuestionHistoryStep
                  key={answer.questionId + answer.answer + index}
                  answer={answer}
                  opacity={index == 0 ? 1 : 0.6}
                  index={index}
                />
              ))}
            </KvibSteps.List>
          </KvibSteps.Root>
          <Separator borderColor="gray.200" marginTop="10" />
        </Flex>
      )}
    </Flex>
  );
}

function QuestionHistoryStep({
  answer,
  opacity,
  index,
}: {
  answer: Answer;
  opacity: number;
  index: number;
}) {
  const {
    data: username,
    error: usernameError,
    isPending: usernameIsLoading,
  } = useFetchUsername(answer.actor);

  return (
    <KvibSteps.Item index={index} width="100%">
      <Grid templateColumns="3rem 1fr 1fr 1fr" width="100%">
        <KvibSteps.Indicator asChild>
          <KvibSteps.Status
            incomplete={
              <Icon color={'{colors.gray.200}'} icon="circle" size={40} />
            }
            complete={
              <Icon color={'{colors.gray.200}'} icon="circle" size={40} />
            }
            current={
              <Icon
                color={'{colors.blue.500}'}
                icon="circle"
                filled
                size={40}
              />
            }
          />
        </KvibSteps.Indicator>
        <Box>
          <KvibSteps.Title style={{ fontWeight: 'bold' }}>
            Endret svar
          </KvibSteps.Title>
          <KvibSteps.Description>
            {formatDateTime(answer.updated)}
          </KvibSteps.Description>
        </Box>
        <Stack flexDirection="row" opacity={opacity}>
          <Icon icon="trip_origin" color={'{colors.blue.500}'} />
          <Text color={'{colors.blue.500}'}>
            {answer.answer ? answer.answer : '-'}{' '}
            {answer.answer &&
              (answer.answerType === 'PERCENT' ? '%' : answer.answerUnit || '')}
          </Text>
        </Stack>
        <Stack flexDirection="row" opacity={opacity}>
          <Icon icon="person" filled color={'{colors.blue.500}'} />
          {usernameIsLoading ? (
            <Text color={'{colors.blue.500}'}>Laster...</Text>
          ) : usernameError ? (
            <Text color={'{colors.blue.500}'}>Feil ved henting av bruker</Text>
          ) : (
            <Text color={'{colors.blue.500}'}>{username}</Text>
          )}
        </Stack>
        <KvibSteps.Separator style={{ justifySelf: 'left' }} />
      </Grid>
    </KvibSteps.Item>
  );
}
