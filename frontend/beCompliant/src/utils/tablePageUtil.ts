import { ActiveFilter, Question } from '../api/types';

export const filterData = (
  data: Question[],
  filters: ActiveFilter[]
): Question[] => {
  if (!filters.length || !data.length) return data;
  return filters.reduce((filteredData, filter) => {
    const fieldName = filter.filterName;

    if (!fieldName) {
      console.error(`Invalid filter field name: ${filter.filterName}`);
      return filteredData;
    }

    return filteredData.filter((record: Question) => {
      const recordField = record.metadata.optionalFields?.find(
        (field) => field.key === fieldName
      )?.value[0];

      if (typeof recordField === 'string')
        return recordField === filter.filterValue;
      if (typeof recordField === 'number')
        return recordField === filter.filterValue;
      return false;
    });
  }, data);
};
