import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';
import { useQuery } from '@tanstack/react-query';

type Group = {
  id: string;
  displayName: string;
};

type UserInfo = {
  groups: Group[];
};

export const useFetchUserinfo = () => {
  const queryKeys = apiConfig.userinfo.queryKey;
  const url = apiConfig.userinfo.url;

  return useQuery({
    queryKey: queryKeys,
    queryFn: () =>
      axiosFetch<UserInfo>({ url: url }).then((response) => response.data),
  });
};
