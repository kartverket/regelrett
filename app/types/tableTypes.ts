export type TableMetaData = {
  id: string;
  name: string;
  primaryFieldId: string;
  views: View[];
  fields: Field[];
};

export type View = {
  id: string;
  name: string;
  type: string;
};

export type AnswerType = {
  questionId: string;
  answer: string;
  updated: string;
  comment: string;
};

export type Comment = {
  actor: string;
  questionId: string;
  comment: string;
  team?: string;
  updated: string;
};

export type Field = {
  id: string;
  name: string;
  type: string;
  options: Option | null;
};

export type Option = {
  inverseLinkFieldId: string;
  isReversed: boolean;
  linkedTableId: string;
  prefersSingleRecordLink: boolean;
  choices: Choice[];
};

export type Choice = {
  id: string;
  name: string;
  color: string;
};

export type Fields = {
  Kortnavn: string;
  Pri: string;
  Løpenummer: number;
  Ledetid: string;
  Sikkerhetskontroller: string;
  Område: string;
  Hvem: string[];
  Kode: string;
  ID: string;
  question: string;
  updated: string;
  answer: string;
  actor: string;
  Status: string;
  comment: string;
};

export type RecordType = Record<string, Fields>;

export type ActiveFilter = {
  id: string;
  value: string;
};
