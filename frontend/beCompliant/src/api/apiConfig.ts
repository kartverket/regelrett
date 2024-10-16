// Query Keys / Individual paths
const PATH_ANSWERS = '/answers';
const PATH_ANSWER = '/answer';
const PATH_COMMENTS = '/comments';
const PATH_TABLE = '/tables';
const PATH_LOGIN = '/login';
const PATH_LOGOUT = '/logout';
const PATH_AUTH_STATUS = '/auth-status';
const PATH_USERINFO = '/userinfo';
const PATH_CURRENT_USER = '/currenUser';
const PATH_USERNAME = '/username';
const PATH_COLUMNS = '/columns';
const PATH_FIRSK_FUNCTIONS = '/frisk/functions';
const PATH_FIRSK_METADATA = '/frisk/metadata';

// Base URLs

const API_URL_BASE = import.meta.env.VITE_BACKEND_URL;
// API Endpoints
const API_URL_ANSWERS = `${API_URL_BASE}${PATH_ANSWERS}`;
const API_URL_ANSWER = `${API_URL_BASE}${PATH_ANSWER}`;
const API_URL_COMMENTS = `${API_URL_BASE}${PATH_COMMENTS}`;
export const API_URL_LOGIN = `${API_URL_BASE}${PATH_LOGIN}`;
export const API_URL_LOGOUT = `${API_URL_BASE}${PATH_LOGOUT}`;
export const API_URL_AUTH_STATUS = `${API_URL_BASE}${PATH_AUTH_STATUS}`;
const API_URL_USERINFO = `${API_URL_BASE}${PATH_USERINFO}`;
const API_URL_CURRENT_USER = `${API_URL_BASE}${PATH_USERINFO}${PATH_CURRENT_USER}`;
const API_URL_FRISK_FUNCTIONS = `${API_URL_BASE}${PATH_FIRSK_FUNCTIONS}`;
const API_URL_FRISK_METADATA = `${API_URL_BASE}${PATH_FIRSK_METADATA}`;

export const apiConfig = {
  answers: {
    queryKey: [PATH_ANSWERS],
    url: API_URL_ANSWERS,
    withTeam: {
      queryKey: (
        tableId?: string,
        team?: string,
        functionId?: number,
        contextId?: string
      ) => [PATH_ANSWERS, team, tableId, functionId, contextId],
      url: (
        tableId?: string,
        team?: string,
        functionId?: number,
        contextId?: string
      ) =>
        `${API_URL_ANSWERS}?${team ? `teamId=${team}` : functionId ? `functionId=${functionId}` : `contextId=${contextId}`}${tableId ? `&tableId=${tableId}` : ''}`,
    },
  },
  answer: {
    queryKey: [PATH_ANSWER],
    url: API_URL_ANSWER,
  },
  answersForQuestion: {
    queryKey: (
      team?: string,
      functionId?: number,
      tableId?: string,
      recordId?: string,
      contextId?: string
    ) => [PATH_ANSWERS, recordId, team, functionId, tableId, contextId],
    url: (
      team?: string,
      functionId?: number,
      tableId?: string,
      recordId?: string,
      contextId?: string
    ) =>
      `${API_URL_ANSWERS}?${team ? `teamId=${team}` : functionId ? `functionId=${functionId}` : contextId ? `contextId=${contextId}` : ''}${tableId ? `&tableId=${tableId}` : ''}${recordId ? `&recordId=${recordId}` : ''}`,
  },
  comments: {
    queryKey: [PATH_COMMENTS],
    url: API_URL_COMMENTS,
    withTeam: {
      queryKey: (
        team?: string,
        functionId?: number,
        tableId?: string,
        contextId?: string
      ) => [PATH_COMMENTS, team, functionId, tableId, contextId],
      url: (
        tableId?: string,
        team?: string,
        functionId?: number,
        contextId?: string
      ) =>
        `${API_URL_COMMENTS}?${team ? `teamId=${team}` : functionId ? `functionId=${functionId}` : `contextId=${contextId}`}${tableId ? `&tableId=${tableId}` : ''}`,
    },
  },
  commentsForQuestion: {
    queryKey: (
      tableId?: string,
      team?: string,
      functionId?: number,
      recordId?: string,
      contextId?: string
    ) => [PATH_COMMENTS, tableId, recordId, team, functionId, contextId],
    url: (
      tableId?: string,
      team?: string,
      functionId?: number,
      recordId?: string,
      contextId?: string
    ) =>
      `${API_URL_ANSWERS}?${team ? `teamId=${team}` : functionId ? `functionId=${functionId}` : contextId ? `contextId=${contextId}` : ''}${tableId ? `&tableId=${tableId}` : ''}${recordId ? `&recordId=${recordId}` : ''}`,
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
  currentUser: {
    queryKey: [PATH_CURRENT_USER],
    url: API_URL_CURRENT_USER,
  },
  username: {
    queryKey: () => [PATH_USERNAME],
    url: (userId: string) =>
      `${API_URL_BASE}${PATH_USERINFO}/${userId}${PATH_USERNAME}`,
  },
  authStatus: {
    queryKey: [PATH_AUTH_STATUS],
    url: API_URL_AUTH_STATUS,
  },
  friskFunctions: {
    queryKey: (functionId?: number) => [PATH_FIRSK_FUNCTIONS, functionId],
    url: (functionId?: number) => `${API_URL_FRISK_FUNCTIONS}/${functionId}`,
  },
  friskMetadata: {
    queryKey: (teamId?: string) => [PATH_FIRSK_METADATA, teamId],
    url: (teamId?: string) => `${API_URL_FRISK_METADATA}?teamId=${teamId}`,
  },
} as const;
