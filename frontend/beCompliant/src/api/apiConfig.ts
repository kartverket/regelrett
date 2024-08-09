// Query Keys / Individual paths
const PATH_ANSWERS = '/answers';
const PATH_ANSWER = '/answer';
const PATH_COMMENTS = '/comments';
const PATH_METODEVERK = '/metodeverk';
const PATH_KONTROLLERE = '/kontrollere';
const PATH_TABLE = '/table';
const PATH_LOGIN = '/login';
const PATH_AUTH_STATUS = '/auth-status';

// Base URLs

const API_URL_BASE = import.meta.env.VITE_BACKEND_URL;
// API Endpoints
const API_URL_ANSWERS = `${API_URL_BASE}${PATH_ANSWERS}`;
const API_URL_ANSWER = `${API_URL_BASE}${PATH_ANSWER}`;
const API_URL_COMMENTS = `${API_URL_BASE}${PATH_COMMENTS}`;
const API_URL_METODEVERK = `${API_URL_BASE}${PATH_METODEVERK}`;
export const API_URL_LOGIN = `${API_URL_BASE}${PATH_LOGIN}`;
export const API_URL_AUTH_STATUS = `${API_URL_BASE}${PATH_AUTH_STATUS}`;

export const apiConfig = {
  answers: {
    queryKey: [PATH_ANSWERS],
    url: API_URL_ANSWERS,
    withTeam: {
      queryKey: (team: string) => [PATH_ANSWERS, team],
      url: (team: string) => `${API_URL_ANSWERS}/${team}`,
    },
  },
  answer: {
    queryKey: [PATH_ANSWER],
    url: API_URL_ANSWER,
  },
  comments: {
    queryKey: [PATH_COMMENTS],
    url: API_URL_COMMENTS,
    withTeam: {
      queryKey: (team: string) => [PATH_COMMENTS, team],
      url: (team: string) => `${API_URL_COMMENTS}/${team}`,
    },
  },
  metodeverk: {
    queryKey: [PATH_METODEVERK],
    url: API_URL_METODEVERK,
  },
  kontrollere: {
    queryKey: (team?: string) => [PATH_KONTROLLERE, team],
    url: (team?: string) => `${API_URL_BASE}/${team}${PATH_KONTROLLERE}`,
  },
  table: {
    queryKey: (tableId: string) => [PATH_TABLE, tableId],
    url: (tableId: string) => `${API_URL_BASE}${PATH_TABLE}/${tableId}`,
    withTeam: {
      queryKey: (tableId: string, team: string) => [PATH_TABLE, tableId, team],
      url: (tableId: string, team: string) =>
        `${API_URL_BASE}${PATH_TABLE}/${tableId}?team=${team}`,
    },
  },
} as const;
