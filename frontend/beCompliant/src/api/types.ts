export enum AnswerType {
  SELECT_MULTIPLE = 'SELECT_MULTIPLE',
  SELECT_SINGLE = 'SELECT_SINGLE',
  TEXT_MULTI_LINE = 'TEXT_MULTI_LINE',
  TEXT_SINGLE_LINE = 'TEXT_SINGLE_LINE',
  PERCENT = 'PERCENT',
  TIME = 'TIME',
}

export type Answer = {
  actor: string;
  answer: string;
  answerUnit?: string;
  answerType: string;
  quesiton: string;
  questionId: string;
  team: string | null;
  tableId: string;
  functionId: number | null;
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
  recordId: string;
  team: string | null;
  tableId: string;
  functionId: number | null;
  updated: Date;
};

export type Column = {
  options: Option[] | null;
  name: string;
  type: OptionalFieldType;
};

export type Option = {
  name: string;
  color?: string;
};

export enum OptionalFieldType {
  OPTION_MULTIPLE = 'OPTION_MULTIPLE',
  OPTION_SINGLE = 'OPTION_SINGLE',
  TEXT = 'TEXT',
  DATE = 'DATE',
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
  recordId: string;
  metadata: QuestionMetadata;
  question: string;
  updated: Date | undefined;
};

export type QuestionMetadata = {
  answerMetadata: AnswerMetadata;
  optionalFields: OptionalField[] | null;
};

export type Table = {
  id: string;
  columns: Column[];
  name: string;
  records: Question[];
};

export type AuthStatus = {
  authenticated: boolean;
};

export type FriskFunction = {
  id: number;
  path: string;
  parentId: number;
  name: string;
  description: string;
};

export type FriskMetadata = {
  id: number;
  functionId: number;
  key: string;
  value: string;
};

export type User = {
  id: string;
  displayName: string;
};
