import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiConfig } from '../api/apiConfig';
import { Comment } from '../api/types';
import { axiosFetch } from '../api/Fetch';
import { useToast } from '@kvib/react';

export function useComments(contextId?: string) {
  return useQuery({
    queryKey: apiConfig.comments.queryKey(contextId!),
    queryFn: () =>
      axiosFetch<Comment[]>({
        url: apiConfig.comments.url(contextId!),
      }).then((response) => response.data),
    select: formatCommentData,
    enabled: !!contextId,
  });
}

function formatCommentData(comments: Comment[]) {
  return comments.map((comment: Comment) => {
    return {
      ...comment,
      updated: new Date(comment.updated),
    };
  });
}

export function useFetchCommentsForQuestion(
  contextId?: string,
  recordId?: string
) {
  return useQuery({
    queryKey: apiConfig.comments.queryKey(contextId!, recordId!),
    queryFn: () =>
      axiosFetch<Comment[]>({
        url: apiConfig.comments.url(contextId!, recordId!),
      }).then((response) => response.data),
    enabled: !!recordId && !!contextId,
  });
}

export function useDeleteComment(
  contextId: string,
  recordId: string | undefined,
  onSuccess: () => void
) {
  const URL = apiConfig.comments.url(contextId, recordId);
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: apiConfig.comments.queryKey(contextId, recordId),
    mutationFn: () => {
      return axiosFetch({
        url: URL,
        method: 'DELETE',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiConfig.comments.queryKey(contextId, recordId),
      });
      await queryClient.invalidateQueries({
        queryKey: apiConfig.comments.queryKey(contextId),
      });
      onSuccess();
    },
    onError: () => {
      const toastId = 'delete-comment-error';
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
