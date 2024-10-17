import { useToast } from '@kvib/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';
import { AxiosError } from 'axios';

type SubmitContextRequest = {
  teamId: string;
  tableId: string;
  name: string;
};

export interface SubmitContextResponse {
  id: string;
  teamId: string;
  tableId: string;
  name: string;
}

export function useSubmitContext() {
  const URL = apiConfig.contexts.url;
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: apiConfig.contexts.queryKey,
    mutationFn: (body: SubmitContextRequest) => {
      return axiosFetch<SubmitContextResponse>({
        url: URL,
        method: 'POST',
        data: body,
      });
    },
    onSuccess: async () => {
      const toastId = 'submit-context-success';
      if (!toast.isActive(toastId)) {
        toast({
          title: 'Suksess',
          description: 'Konteksten ble opprettet',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: apiConfig.contexts.queryKey,
      });
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        const toastId = 'submit-context-conflict';
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'Konflikt',
            description: 'Et skjema med dette navnet eksisterer allerede.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        const toastId = 'submit-context-error';
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
      }
    },
  });
}
