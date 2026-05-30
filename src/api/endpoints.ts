import type {
  AdminDashboardResponse,
  AdminUserCard,
  AdminUserLookup,
  BeneficiaryCategoriesResponse,
  CitiesResponse,
  Complaint,
  CreateSkillCatalogItemRequest,
  HelpRequestDetails,
  HelpRequestReasonPayload,
  HelpRequestCategoriesResponse,
  HelpRequestReasonCodesResponse,
  HelpRequestSummary,
  HelpRequestVersion,
  LoginRequest,
  MarkAllNotificationsReadResponse,
  ModerationAuditEntry,
  Notification,
  PaginatedResponse,
  PartnerDashboardResponse,
  PardonUserTrustRequest,
  ReasonPayload,
  RecordManualTrustEventRequest,
  ReportDetails,
  ReviewMaterialReportRequest,
  ReportSummary,
  ReportVersion,
  ReviewComplaintRequest,
  SkillCatalogAdminItem,
  StaffMember,
  TokensResponse,
  UnreadNotificationsCountResponse,
  UserPublicProfile,
  UserTrustStatus,
  UserTrustStatusWithEvents,
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

export const beneficiariesApi = {
  categories: () => apiRequest<BeneficiaryCategoriesResponse>('/api/beneficiaries/categories'),
}

export const locationsApi = {
  cities: () => apiRequest<CitiesResponse>('/api/locations/cities'),
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
  reviewMaterial: (id: string, payload: ReviewMaterialReportRequest) =>
    apiRequest<ReportDetails>(`/api/reports/${id}/review-material`, { method: 'POST', body: payload }),
}

export const verificationsApi = {
  list: (params: ListParams) => apiRequest<VerificationAttemptSummary[]>('/api/verifications', undefined, params),
  get: (id: string) => apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}`),
  approve: (id: string) =>
    apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}/approve`, { method: 'POST' }),
  reject: (id: string, payload: ReasonPayload) =>
    apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}/reject`, { method: 'POST', body: payload }),
  revoke: (id: string, payload: ReasonPayload) =>
    apiRequest<VerificationAttemptDetails>(`/api/verifications/${id}/revoke`, { method: 'POST', body: payload }),
}

export const partnersApi = {
  dashboard: () => apiRequest<PartnerDashboardResponse>('/api/partners/dashboard'),
}

export const adminsApi = {
  dashboard: () => apiRequest<AdminDashboardResponse>('/api/admins/dashboard'),
  lookupUser: (params: { phone?: string; email?: string; user_id?: string }) =>
    apiRequest<AdminUserLookup>('/api/admins/users', undefined, params),
  getUserCard: (userId: string) => apiRequest<AdminUserCard>(`/api/admins/users/${userId}`),
  deactivateUser: (userId: string) =>
    apiRequest<void>(`/api/admins/users/${userId}/deactivate`, { method: 'POST' }),
  listStaff: (role: string) => apiRequest<StaffMember[]>('/api/admins/staff', undefined, { role }),
  deactivateStaff: (userId: string, role: string) =>
    apiRequest<void>(`/api/admins/staff/${userId}/deactivate`, { method: 'POST' }, { role }),
  moderationAudit: (params?: ListParams) =>
    apiRequest<ModerationAuditEntry[]>('/api/admins/moderation-audit', undefined, params),
  skillCatalog: (includeInactive = false) =>
    apiRequest<SkillCatalogAdminItem[]>('/api/admins/skills/catalog', undefined, {
      include_inactive: includeInactive,
    }),
  createSkillCatalogItem: (payload: CreateSkillCatalogItemRequest) =>
    apiRequest<SkillCatalogAdminItem>('/api/admins/skills/catalog', { method: 'POST', body: payload }),
}

export const complaintsApi = {
  list: (params?: ListParams) => apiRequest<Complaint[]>('/api/complaints', undefined, params),
  review: (complaintId: string, payload: ReviewComplaintRequest) =>
    apiRequest<Complaint>(`/api/complaints/${complaintId}/review`, { method: 'POST', body: payload }),
}

export const userTrustApi = {
  get: (userId: string, params?: ListParams) =>
    apiRequest<UserTrustStatus>(`/api/user-trust/${userId}`, undefined, params),
  getWithEvents: (userId: string, params?: ListParams) =>
    apiRequest<UserTrustStatusWithEvents>(`/api/user-trust/${userId}`, undefined, {
      include_events: true,
      ...params,
    }),
  recordManualEvent: (userId: string, payload: RecordManualTrustEventRequest) =>
    apiRequest<void>(`/api/user-trust/${userId}/events`, { method: 'POST', body: payload }),
  pardon: (userId: string, payload: PardonUserTrustRequest = {}) =>
    apiRequest<void>(`/api/user-trust/${userId}/pardon`, { method: 'POST', body: payload }),
}

export const usersApi = {
  getPublicProfile: (userId: string) => apiRequest<UserPublicProfile>(`/api/users/${userId}`),
}

export const volunteersApi = {
  skillCatalog: () => apiRequest<VolunteerSkillCatalogItem[]>('/api/volunteers/skills/catalog'),
}

export const notificationsApi = {
  list: (params?: ListParams) =>
    apiRequest<PaginatedResponse<Notification>>('/api/notifications', undefined, params),
  unreadCount: () => apiRequest<UnreadNotificationsCountResponse>('/api/notifications/unread-count'),
  markRead: (notificationId: string) =>
    apiRequest<Notification>(`/api/notifications/${notificationId}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    apiRequest<MarkAllNotificationsReadResponse>('/api/notifications/read-all', { method: 'PATCH' }),
}
