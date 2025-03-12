import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';
import { useQuery } from '@tanstack/react-query';
import { User } from '../api/types';

type Group = {
  id: string;
  displayName: string;
};

export type UserInfo = {
  groups: Group[];
  user: User;
  superuser: boolean;
};

export const useUser = () => {
  const queryKeys = apiConfig.userinfo.queryKey;
  const url = apiConfig.userinfo.url;

  return useQuery({
    queryKey: queryKeys,
    queryFn: () =>
      axiosFetch<UserInfo>({ url: url }).then((response) => response.data),
  });
};

export function useFetchUsername(userId: string) {
  return useQuery({
    queryKey: apiConfig.username.queryKey(userId),
    queryFn: () =>
      axiosFetch<string>({
        url: apiConfig.username.url(userId),
      }).then((response) => response.data),
    enabled: userId !== undefined,
  });
}
