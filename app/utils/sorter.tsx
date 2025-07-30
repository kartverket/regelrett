import type { Fields, RecordType } from "../types/tableTypes";

export const sortData = (
  data: RecordType[],
  field?: keyof Fields,
): RecordType[] => {
  if (!field) {
    return data;
  }

  const isDate = (value: any): boolean => {
    return !isNaN(Date.parse(value));
  };

  const sortedData = [...data];
  sortedData.sort((recordA, recordB) => {
    const fieldA = Object.values(recordA)[2];
    const fieldB = Object.values(recordB)[2];

    const valueA = fieldA[field];
    const valueB = fieldB[field];

    if (valueA === undefined && valueB === undefined) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;

    const isValueADate = isDate(valueA);
    const isValueBDate = isDate(valueB);

    if (isValueADate && isValueBDate) {
      const dateA = new Date(valueA.toString());
      const dateB = new Date(valueB.toString());

      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    }

    if (isValueADate) return -1;
    if (isValueBDate) return 1;

    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;
    return 0;
  });
  return sortedData;
};
