import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';

export function useFetchUsername(userId: string) {
  return useQuery({
    queryKey: apiConfig.username.queryKey(),
    queryFn: () =>
      axiosFetch<string>({
        url: apiConfig.username.url(userId),
      }).then((response) => response.data),
    enabled: userId !== undefined,
  });
}
