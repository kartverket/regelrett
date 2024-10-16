import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '../api/apiConfig';
import { axiosFetch } from '../api/Fetch';
import { User } from '../api/types';

export const useFetchCurrentUser = () => {
  return useQuery({
    queryKey: apiConfig.currentUser.queryKey,
    queryFn: () =>
      axiosFetch<User>({ url: apiConfig.currentUser.url }).then(
        (response) => response.data
      ),
  });
};
