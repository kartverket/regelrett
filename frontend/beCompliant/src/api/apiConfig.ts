// Query Keys / Individual paths
const PATH_ANSWERS = '/answers';
const PATH_ANSWER = '/answer';
const PATH_COMMENTS = '/comments';
const PATH_TABLE = '/tables';
const PATH_USERINFO = '/userinfo';
const PATH_USERNAME = '/username';
const PATH_COLUMNS = '/columns';
const PATH_CONTEXTS = '/contexts';
const PATH_DUMP_CSV = '/dump-csv';

// Base URLs

const API_URL_BASE = import.meta.env.VITE_BACKEND_URL;
// API Endpoints
const API_URL_ANSWERS = `${API_URL_BASE}${PATH_ANSWERS}`;
const API_URL_ANSWER = `${API_URL_BASE}${PATH_ANSWER}`;
const API_URL_COMMENTS = `${API_URL_BASE}${PATH_COMMENTS}`;
const API_URL_CONTEXTS = `${API_URL_BASE}${PATH_CONTEXTS}`;
const API_URL_DUMP_CSV = `${API_URL_BASE}${PATH_DUMP_CSV}`;
export const API_URL_USERINFO = `${API_URL_BASE}${PATH_USERINFO}`;

export const apiConfig = {
  answers: {
    queryKey: (contextId: string, recordId?: string) => [
      PATH_ANSWERS,
      contextId,
      recordId,
    ],
    url: (contextId: string, recordId?: string) =>
      `${API_URL_ANSWERS}?contextId=${contextId}${recordId ? `&recordId=${recordId}` : ''}`,
  },
  answer: {
    queryKey: [PATH_ANSWER],
    url: API_URL_ANSWER,
  },
  comments: {
    queryKey: (contextId: string, recordId?: string) => [
      PATH_COMMENTS,
      contextId,
      recordId,
    ],
    url: (contextId: string, recordId?: string) =>
      `${API_URL_COMMENTS}?contextId=${contextId}${recordId ? `&recordId=${recordId}` : ''}`,
  },
  comment: {
    queryKey: [PATH_COMMENTS],
    url: API_URL_COMMENTS,
  },
  table: {
    queryKey: (tableId: string) => [PATH_TABLE, tableId],
    url: (tableId: string) => `${API_URL_BASE}${PATH_TABLE}/${tableId}`,
  },
  tables: {
    queryKey: () => [PATH_TABLE],
    url: () => `${API_URL_BASE}${PATH_TABLE}`,
  },
  question: {
    queryKey: (tableId: string, recordId: string) => [
      PATH_TABLE,
      tableId,
      recordId,
    ],
    url: (tableId: string, recordId: string) =>
      `${API_URL_BASE}${PATH_TABLE}/${tableId}/${recordId}`,
  },
  columns: {
    queryKey: () => [PATH_COLUMNS],
    url: (tableId: string) =>
      `${API_URL_BASE}${PATH_TABLE}/${tableId}${PATH_COLUMNS}`,
  },
  userinfo: {
    queryKey: [PATH_USERINFO],
    url: API_URL_USERINFO,
  },
  username: {
    queryKey: () => [PATH_USERNAME],
    url: (userId: string) =>
      `${API_URL_BASE}${PATH_USERINFO}/${userId}${PATH_USERNAME}`,
  },
  contexts: {
    queryKey: [PATH_CONTEXTS],
    url: API_URL_CONTEXTS,
    byId: {
      queryKey: (contextId: string) => [PATH_CONTEXTS, contextId],
      url: (contextId: string) => `${API_URL_CONTEXTS}/${contextId}`,
    },
    forTeam: {
      queryKey: (teamId: string) => [PATH_CONTEXTS, teamId],
      url: (teamId: string) => `${API_URL_CONTEXTS}?teamId=${teamId}`,
    },
    forTeamAndTable: {
      queryKey: (teamId: string, tableId: string) => [
        PATH_CONTEXTS,
        teamId,
        tableId,
      ],
      url: (teamId: string, tableId: string) =>
        `${API_URL_CONTEXTS}?teamId=${teamId}&tableId=${tableId}`,
    },
  },
  dumpCSV: {
    queryKey: [PATH_DUMP_CSV],
    url: API_URL_DUMP_CSV,
  },
} as const;
