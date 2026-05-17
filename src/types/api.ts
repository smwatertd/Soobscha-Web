export type Nullable<T> = T | null
export type JsonObject = Record<string, unknown>

export type TokensResponse = {
  access_token: string
  refresh_token: string
  token_type?: string
}

export type LoginRequest = {
  email?: string | null
  phone_number?: string | null
  password: string
}

export type PaginatedResponse<T> = {
  page: number
  page_size: number
  total_count: number
  has_more: boolean
  items: T[]
}

export type MediaFile = {
  media_id: string
  url: string
  preview_url?: Nullable<string>
  expires_at: string
}

export type ModerationAction =
  | 'approve'
  | 'reject'
  | 'return_to_rework'
  | 'return-to-rework'
  | 'cancel'
  | 'interrupt'
  | string

export type HelpRequestType = 'MATERIAL' | 'SOCIAL' | string

export type HelpRequestSummary = {
  id: string
  beneficiary_user_id: string
  type: HelpRequestType
  title: string
  description: string
  category: string
  status: string
  report_status?: string
  created_at?: string
  updated_at?: string
  media_files?: MediaFile[]
  amount_requested_kopeks?: number
  amount_collected_kopeks?: number
  min_volunteers?: number
  max_volunteers?: number
  start_at?: string
  duration_minutes?: number
  required_skills?: string[]
  preferred_skills?: string[]
  address_text?: string
  place_name?: Nullable<string>
}

export type HelpRequestDetails = HelpRequestSummary & {
  report?: Nullable<ReportDetails>
  available_actions?: ModerationAction[]
  financials?: JsonObject
  donations?: JsonObject
  latitude?: number
  longitude?: number
  cancellation_reason?: Nullable<string>
  interruption_reason?: Nullable<string>
  return_reason?: Nullable<string>
  rejection_reason?: Nullable<string>
}

export type HelpRequestVersion = JsonObject & {
  version_number?: number
  status?: string
  title?: string
  created_at?: string
  updated_at?: string
}

export type ReportSummary = {
  id: string
  help_request_id: string
  help_request_type: string
  status: string
  settlement_status?: Nullable<string>
  created_at: string
  updated_at: string
  media_files?: MediaFile[]
  spent_confirmed_kopeks?: Nullable<number>
}

export type ReportDetails = ReportSummary & {
  payload: JsonObject
  available_actions?: ModerationAction[]
  approved_at?: Nullable<string>
  rejected_at?: Nullable<string>
  returned_at?: Nullable<string>
  rejection_reason?: Nullable<string>
  return_reason?: Nullable<string>
}

export type ReportVersion = JsonObject & {
  version_number?: number
  status?: string
  created_at?: string
  updated_at?: string
}

export type VerificationAttemptSummary = {
  id: string
  user_id: string
  user_role: string
  category?: Nullable<string>
  status: string
  applicant_full_name?: Nullable<string>
  applicant_city?: Nullable<string>
  derived_valid_until?: Nullable<string>
  rejection_reason?: Nullable<string>
  approved_at?: Nullable<string>
  rejected_at?: Nullable<string>
  revoked_at?: Nullable<string>
  created_at: string
  updated_at: string
}

export type VerificationAttemptDetails = VerificationAttemptSummary & {
  common_data: JsonObject
  category_data: JsonObject
  public_snapshot_json?: Nullable<JsonObject>
  approved_by_user_id?: Nullable<string>
  rejected_by_user_id?: Nullable<string>
  revoked_by_user_id?: Nullable<string>
  revocation_reason?: Nullable<string>
}

export type ReasonPayload = {
  reason: string
}

export type HelpRequestReasonPayload = ReasonPayload & {
  code?: string
}

export type CodeLabel = {
  code: string
  label: string
}

export type HelpRequestReasonCodesByType = {
  cancellation: CodeLabel[]
  interruption: CodeLabel[]
}

export type HelpRequestReasonCodesResponse = {
  material: HelpRequestReasonCodesByType
  social: HelpRequestReasonCodesByType
}

export type HelpRequestCategoriesResponse = {
  material: CodeLabel[]
  social: CodeLabel[]
}

export type PartnerDashboardSplitCounter = {
  material: number
  social: number
  total: number
}

export type PartnerDashboardVerificationCounter = {
  beneficiaries: number
  volunteers: number
  total: number
}

export type PartnerDashboardResponse = {
  queues: {
    help_requests_pending_moderation: PartnerDashboardSplitCounter
    reports_pending_moderation: PartnerDashboardSplitCounter
    verifications_pending_moderation: PartnerDashboardVerificationCounter
    material_reports_awaiting_settlement_review: number
  }
}

export type VolunteerSkillCatalogItem = {
  code: string
  label: string
  group: string
  requires_verified: boolean
}
