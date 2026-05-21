import axios from 'axios';
import type {
  DailyChallenge,
  EndSessionResponse,
  Progress,
  Scenario,
  SendMessageResponse,
  Session,
  SessionDetail,
} from '../types';

const api = axios.create({ baseURL: '/api' });

export const scenariosApi = {
  list: () => api.get<Scenario[]>('/scenarios').then(r => r.data),
  get: (id: number) => api.get<Scenario>(`/scenarios/${id}`).then(r => r.data),
};

export const sessionsApi = {
  start: (scenario_id: number, difficulty: string) =>
    api.post<Session>('/sessions', { scenario_id, difficulty }).then(r => r.data),

  sendMessage: (session_id: string, content: string) =>
    api
      .post<SendMessageResponse>(`/sessions/${session_id}/message`, { content })
      .then(r => r.data),

  get: (session_id: string) =>
    api.get<SessionDetail>(`/sessions/${session_id}`).then(r => r.data),

  end: (session_id: string) =>
    api.post<EndSessionResponse>(`/sessions/${session_id}/end`).then(r => r.data),
};

export const progressApi = {
  get: () => api.get<Progress>('/progress').then(r => r.data),
  dailyChallenge: () => api.get<DailyChallenge>('/daily-challenge').then(r => r.data),
};
