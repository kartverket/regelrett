import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '../api/apiConfig';
import { axiosFetch } from '../api/Fetch';
import { Context } from './useFetchTeamContexts';
import { UserInfo } from './useFetchUserinfo';

export function useFetchAllContexts() {
  return useQuery({
    queryKey: ['allContexts'],
    queryFn: async () => {
      const userInfo: UserInfo = await axiosFetch<UserInfo>({
        url: apiConfig.userinfo.url,
      }).then((response) => response.data);
      const teams: string[] = userInfo.groups.map((group) => group.id);
      const allContexts: Context[] = [];
      for (const team of teams) {
        const contexts: Context[] = await axiosFetch<Context[]>({
          url: apiConfig.contexts.forTeam.url(team),
        }).then((response) => response.data);
        allContexts.push(...contexts);
      }
      return allContexts;
    },
  });
}
