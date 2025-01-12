import { useToast } from '@kvib/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';

type SubmitCommentsRequest = {
  actor: string;
  recordId: string;
  questionId: string;
  contextId: string;
  comment?: string;
};

export function useSubmitComment(
  contextId: string,
  recordId: string | undefined,
  setEditMode: (editMode: boolean) => void
) {
  const URL = apiConfig.comment.url;
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: apiConfig.comment.queryKey,
    mutationFn: (body: SubmitCommentsRequest) => {
      return axiosFetch<SubmitCommentsRequest>({
        url: URL,
        method: 'POST',
        data: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiConfig.comments.queryKey(contextId, recordId),
      });
      await queryClient.invalidateQueries({
        queryKey: apiConfig.comments.queryKey(contextId),
      });
      setEditMode(false);
    },
    onError: () => {
      const toastId = 'submit-comment-error';
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
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
