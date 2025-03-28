import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '../api/Fetch';
import { apiConfig } from '../api/apiConfig';
import { Form } from '../api/types';

export function useForm(formId?: string) {
  const queryKeys = apiConfig.form.queryKey(formId!);
  const url = apiConfig.form.url(formId!);

  return useQuery({
    queryKey: queryKeys,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    notifyOnChangeProps: ['data', 'error'],
    queryFn: () =>
      axiosFetch<Form>({ url: url }).then((response) => response.data),
    select: formatFormData,
    enabled: !!formId,
  });
}

function formatFormData(data: Form) {
  return {
    ...data,
    records: data.records.map((record) => {
      return {
        ...record,
        updated: record.updated ? new Date(record.updated) : undefined,
      };
    }),
  };
}
