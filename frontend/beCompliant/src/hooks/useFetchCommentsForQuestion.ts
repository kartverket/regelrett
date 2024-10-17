import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '../api/apiConfig';
import { Comment } from '../api/types';
import { axiosFetch } from '../api/Fetch';

export function useFetchCommentsForQuestion(
  tableId?: string,
  contextId?: string,
  recordId?: string
) {
  return useQuery({
    queryKey: apiConfig.comments.queryKey(tableId!, contextId!, recordId!),
    queryFn: () =>
      axiosFetch<Comment[]>({
        url: apiConfig.comments.url(tableId!, contextId!, recordId!),
      }).then((response) => response.data),
    enabled: !!tableId && !!recordId && !!contextId,
  });
}
