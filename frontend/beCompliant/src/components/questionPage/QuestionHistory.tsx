import {
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  Box,
  StepTitle,
  StepDescription,
  StepSeparator,
  Stack,
  Grid,
  useTheme,
} from '@kvib/react';
import { Answer } from '../../api/types';
import { formatDateTime } from '../../utils/formatTime';
import { useFetchUsername } from '../../hooks/useFetchUsername';

type Props = {
  answers: Answer[];
};

export function QuestionHistory({ answers }: Props) {
  const theme = useTheme();
  const steps = answers.slice(-3).reverse();

  return (
    <Flex flexDirection="column" paddingY="5rem">
      <HStack marginBottom="4">
        <Icon icon="schedule" size={26} />
        <Text as="b" fontSize="lg">
          Historikk
        </Text>
      </HStack>
      <Divider borderColor="gray.400" marginBottom="4" />
      <Flex flexDirection="column" gap="3" alignItems="center">
        <Grid templateColumns="3rem 1fr 1fr 1fr" width="100%">
          <Text gridColumnStart="2">NÅR</Text>
          <Text>SVAR</Text>
          <Text>HVEM</Text>
        </Grid>
        <Stepper
          index={0}
          orientation="vertical"
          minHeight="300px"
          gap="0"
          width="100%"
        >
          {steps.map((answer, index) => {
            const {
              data: username,
              error: usernameError,
              isPending: usernameIsLoading,
            } = useFetchUsername(answer.actor);

            return (
              <Step key={index} style={{ width: '100%' }}>
                <Grid templateColumns="3rem 1fr 1fr 1fr" width="100%">
                  <StepIndicator>
                    <StepStatus
                      active={
                        <Icon
                          color={theme.colors.green[500]}
                          icon="circle"
                          isFilled
                          size={37}
                        />
                      }
                    />
                  </StepIndicator>
                  <Box>
                    <StepTitle style={{ fontWeight: 'bold' }}>
                      Endret svar
                    </StepTitle>
                    <StepDescription>
                      {formatDateTime(answer.updated)}
                    </StepDescription>
                  </Box>
                  <Stack flexDirection="row" opacity={index == 0 ? 1 : 0.6}>
                    <Icon icon="trip_origin" color={theme.colors.green[500]} />
                    <Text color={theme.colors.green[500]}>
                      {answer.answer}{' '}
                      {answer.answerType === 'PERCENT'
                        ? '%'
                        : answer.answerUnit || ''}
                    </Text>
                  </Stack>
                  <Stack flexDirection="row" opacity={index == 0 ? 1 : 0.6}>
                    <Icon
                      icon="person"
                      isFilled
                      color={theme.colors.green[500]}
                    />
                    {usernameIsLoading ? (
                      <Text color={theme.colors.green[500]}>Laster...</Text>
                    ) : usernameError ? (
                      <Text color={theme.colors.red[500]}>
                        Feil ved henting av bruker
                      </Text>
                    ) : (
                      <Text color={theme.colors.green[500]}>{username}</Text>
                    )}
                  </Stack>
                  <StepSeparator style={{ justifySelf: 'left' }} />
                </Grid>
              </Step>
            );
          })}
        </Stepper>
        <Divider borderColor="gray.400" marginTop="10" />
      </Flex>
    </Flex>
  );
}
