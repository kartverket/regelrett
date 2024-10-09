import { useToast } from '@kvib/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';

type SubmitCommentsRequest = {
  actor: string;
  recordId: string;
  questionId: string;
  team?: string;
  comment?: string;
};

export function useSubmitComment(setEditMode: (editMode: boolean) => void) {
  const URL = apiConfig.comments.url;
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: apiConfig.comments.queryKey,
    mutationFn: (body: SubmitCommentsRequest) => {
      return axiosFetch<SubmitCommentsRequest>({
        url: URL,
        method: 'POST',
        data: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      const toastId = 'submit-comment-success';
      if (!toast.isActive(toastId)) {
        toast({
          title: 'Suksess',
          description: 'Kommentaren din er lagret',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: apiConfig.comments.queryKey,
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
