import { useToast } from '@kvib/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';

export function useDumpCSV() {
  const URL = apiConfig.dumpCSV.url;
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: apiConfig.dumpCSV.queryKey,
    mutationFn: async (): Promise<Blob> => {
      const response = await axiosFetch({
        url: URL,
        method: 'POST',
        responseType: 'blob',
      });
      return response.data as Blob;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiConfig.dumpCSV.queryKey,
      });
    },
    onError: () => {
      const toastId = 'submit-comment-error';
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Å nei!',
          description:
            'Det kan være du ikke har tilgang til denne funksjonaliteten',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });
}
