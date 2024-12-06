import { FormControl, FormLabel, Select, Skeleton } from '@kvib/react';
import { useFetchAllContexts } from '../../hooks/useFetchAllContexts';
import { Context } from '../../hooks/useFetchTeamContexts';

export function CopyContextDropdown({
  tableId,
  copyContext,
  setCopyContext,
}: {
  tableId: string;
  copyContext: string | null;
  setCopyContext: (context: string) => void;
}) {
  const { data: contexts, isLoading: contextsIsLoading } =
    useFetchAllContexts();

  const contextsForTable: Context[] =
    contexts?.filter((context) => context.tableId === tableId) ?? [];

  if (!contexts || contexts.length === 0) {
    return null;
  }
  return (
    <FormControl>
      <FormLabel
        style={{
          fontSize: 'small',
          fontWeight: 'bold',
        }}
      >
        Kopier svar fra eksisterende skjema
      </FormLabel>
      <Skeleton isLoaded={!contextsIsLoading}>
        <Select
          id="select"
          placeholder="Velg skjema"
          onChange={(e) => setCopyContext(e.target.value)}
          bgColor="white"
          borderColor="gray.200"
          value={copyContext ?? undefined}
        >
          {contextsForTable?.map((context) => (
            <option key={context.id} value={context.id}>
              {context.name}
            </option>
          ))}
        </Select>
      </Skeleton>
    </FormControl>
  );
}
