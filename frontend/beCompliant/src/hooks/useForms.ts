import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';

export function useForms() {
  const queryKeys = apiConfig.forms.queryKey();
  const url = apiConfig.forms.url();

  return useQuery({
    queryKey: queryKeys,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    notifyOnChangeProps: ['data', 'error'],
    queryFn: () =>
      axiosFetch<{ id: string; name: string }[]>({ url: url }).then(
        (response) => response.data
      ),
  });
}
