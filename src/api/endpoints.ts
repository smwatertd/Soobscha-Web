import type {
  HelpRequestDetails,
  HelpRequestReasonPayload,
  HelpRequestCategoriesResponse,
  HelpRequestReasonCodesResponse,
  HelpRequestSummary,
  HelpRequestVersion,
  LoginRequest,
  PaginatedResponse,
  PartnerDashboardResponse,
  ReasonPayload,
  ReportDetails,
  ReportSummary,
  ReportVersion,
  TokensResponse,
  VerificationAttemptDetails,
  VerificationAttemptSummary,
  VolunteerSkillCatalogItem,
} from '../types/api'
import { apiRequest } from './client'

type ListParams = Record<string, string | number | boolean | null | undefined>

export const authApi = {
  login: (payload: LoginRequest) =>
    apiRequest<TokensResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
      skipAuthRefresh: true,
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>('/api/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      skipAuth: true,
      skipAuthRefresh: true,
    }),
}

export const helpRequestsApi = {
  list: (params: ListParams) =>
    apiRequest<PaginatedResponse<HelpRequestSummary>>('/api/help-requests', undefined, params),
  categories: () => apiRequest<HelpRequestCategoriesResponse>('/api/help-requests/categories'),
  reasonCodes: () => apiRequest<HelpRequestReasonCodesResponse>('/api/help-requests/reason-codes'),
  get: (id: string) => apiRequest<HelpRequestDetails>(`/api/help-requests/${id}`),
  history: (id: string) => apiRequest<HelpRequestVersion[]>(`/api/help-requests/${id}/history`),
  approve: (id: string) =>
    apiRequest<HelpRequestDetails>(`/api/help-requests/${id}/approve`, { method: 'POST' }),
  reject: (id: string, payload: ReasonPayload) =>
    apiRequest<HelpRequestDetails>(`/api/help-requests/${id}/reject`, { method: 'POST', body: payload }),
  returnToRework: (id: string, payload: ReasonPayload) =>
    apiRequest<HelpRequestDetails>(`/api/help-requests/${id}/return-to-rework`, { method: 'POST', body: payload }),
  cancel: (id: string, payload: HelpRequestReasonPayload) =>
    apiRequest<HelpRequestDetails>(`/api/help-requests/${id}/cancel`, { method: 'POST', body: payload }),
  interrupt: (id: string, payload: HelpRequestReasonPayload) =>
    apiRequest<HelpRequestDetails>(`/api/help-requests/${id}/interrupt`, { method: 'POST', body: payload }),
}

export const reportsApi = {
  list: (params: ListParams) => apiRequest<PaginatedResponse<ReportSummary>>('/api/reports', undefined, params),
  get: (id: string) => apiRequest<ReportDetails>(`/api/reports/${id}`),
  history: (id: string) => apiRequest<ReportVersion[]>(`/api/reports/${id}/history`),
  approve: (id: string) => apiRequest<ReportDetails>(`/api/reports/${id}/approve`, { method: 'POST' }),
  reject: (id: string, payload: ReasonPayload) =>
    apiRequest<ReportDetails>(`/api/reports/${id}/reject`, { method: 'POST', body: payload }),
  returnToRework: (id: string, payload: ReasonPayload) =>
    apiRequest<ReportDetails>(`/api/reports/${id}/return-to-rework`, { method: 'POST', body: payload }),
}

export const verificationsApi = {
  list: (params: ListParams) => apiRequest<VerificationAttemptSummary[]>('/api/verifications', undefined, params),
  get: (id: string) => apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}`),
  approve: (id: string) =>
    apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}/approve`, { method: 'POST' }),
  reject: (id: string, payload: ReasonPayload) =>
    apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}/reject`, { method: 'POST', body: payload }),
}

export const partnersApi = {
  dashboard: () => apiRequest<PartnerDashboardResponse>('/api/partners/dashboard'),
}

export const volunteersApi = {
  skillCatalog: () => apiRequest<VolunteerSkillCatalogItem[]>('/api/volunteers/skills/catalog'),
}
