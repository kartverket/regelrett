import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';
import { Table } from '../api/types';

export function useFetchTable(tableId?: string, team?: string) {
  const queryKeys = team
    ? apiConfig.table.withTeam.queryKey(tableId ?? '', team)
    : apiConfig.table.queryKey(tableId ?? '');
  const url = team
    ? apiConfig.table.withTeam.url(tableId ?? '', team)
    : apiConfig.table.url(tableId ?? '');

  return useQuery({
    queryKey: queryKeys,
    queryFn: () =>
      axiosFetch<Table>({ url: url }).then((response) => response.data),
  });
}
