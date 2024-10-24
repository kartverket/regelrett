import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';
import { useToast } from '@kvib/react';

type SubmitAnswerRequest = {
  actor: string;
  recordId: string;
  questionId: string;
  question: string;
  answer: string;
  contextId: string;
  answerType: string;
  answerUnit?: string;
};

export function useSubmitAnswers(
  contextId: string,
  recordId: string | undefined
) {
  const URL = apiConfig.answer.url;
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: apiConfig.answer.queryKey,
    mutationFn: (body: SubmitAnswerRequest) => {
      return axiosFetch<SubmitAnswerRequest>({
        url: URL,
        method: 'POST',
        data: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      const toastId = 'submit-answer-success';
      if (!toast.isActive(toastId)) {
        toast({
          title: 'Suksess',
          description: 'Svaret ditt er lagret',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: apiConfig.answers.queryKey(contextId, recordId),
      });
      await queryClient.invalidateQueries({
        queryKey: apiConfig.answers.queryKey(contextId),
      });
    },
    onError: () => {
      const toastId = 'submit-answer-error';
      if (!toast.isActive(toastId)) {
        toast({
          title: 'Å nei!',
          description: 'Det har skjedd en feil. Prøv på nytt',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });
}
