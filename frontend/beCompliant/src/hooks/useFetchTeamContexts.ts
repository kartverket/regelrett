import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '../api/apiConfig';
import { axiosFetch } from '../api/Fetch';

export type Context = {
  id: string;
  name: string;
  tableId: string;
  teamId: string;
};

export function useFetchTeamContexts(teamId?: string) {
  return useQuery({
    queryKey: apiConfig.contexts.forTeam.queryKey(teamId!),
    queryFn: () =>
      axiosFetch<Context[]>({
        url: apiConfig.contexts.forTeam.url(teamId!),
      }).then((response) => response.data),
    enabled: !!teamId,
  });
}
