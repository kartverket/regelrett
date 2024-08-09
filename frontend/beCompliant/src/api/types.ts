export enum AnswerType {
  SELECT_MULTIPLE = 'SELECT_MULTIPLE',
  SELECT_SINGLE = 'SELECT_SINGLE',
  TEXT_MULTI_LINE = 'TEXT_MULTI_LINE',
  TEXT_SINGLE_LINE = 'TEXT_SINGLE_LINE',
}

export type Answer = {
  actor: string;
  answer: string;
  question: string;
  questionId: string;
  team: string | null;
  updated: Date;
};

export type AnswerMetadata = {
  type: AnswerType;
  options: string[] | null;
};

export type Comment = {
  actor: string;
  comment: string;
  questionId: string;
  team: string | undefined;
  updated: Date;
};

export type Field = {
  options: string[] | null;
  name: string;
  type: OptionalFieldType;
};

export enum OptionalFieldType {
  OPTION_MULTIPLE = 'OPTION_MULTIPLE',
  OPTION_SINGLE = 'OPTION_SINGLE',
  TEXT = 'TEXT',
  DATE = 'date',
}

export type OptionalField = {
  key: string;
  options: string[] | null;
  type: OptionalFieldType;
  value: string[];
};

export type Question = {
  answers: Answer[];
  comments: Comment[];
  id: string;
  metadata: QuestionMetadata;
  question: string;
  updated: string | null;
};

export type QuestionMetadata = {
  answerMetadata: AnswerMetadata;
  optionalFields: OptionalField[] | null;
};

export type ActiveFilter = {
  filterName: string;
  filterValue: string;
};

export type Table = {
  id: string;
  fields: Field[];
  name: string;
  records: Question[];
};
