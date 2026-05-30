export type Nullable<T> = T | null
export type JsonObject = Record<string, unknown>

export type ApplicantContactChannel = {
  type: string
  value: string
  label?: Nullable<string>
}

export type ApplicantContact = {
  user_id: string
  phone_number: string | null
  contact_channels?: ApplicantContactChannel[]
}

export type BeneficiaryPublicSummary = {
  user_id: string
  first_name: string
  last_name: string
  age: Nullable<number>
  base_category: Nullable<string>
  city: Nullable<string>
}

export type UserPublicProfile = JsonObject & {
  user_id?: string
  id?: string
  full_name?: Nullable<string>
  name?: Nullable<string>
  role?: Nullable<string>
  user_role?: Nullable<string>
  city?: Nullable<string>
  avatar_url?: Nullable<string>
  avatar?: Nullable<string | JsonObject>
  email?: Nullable<string>
  phone_number?: Nullable<string>
}

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

export type SocialHelpRequestParticipantsSummary = {
  joined: number
  attended: number
  no_show: number
  left_after_start: number
  unjoined: number
  total: number
}

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
  items_to_bring?: string[]
  address_text?: string
  place_name?: Nullable<string>
  distance_km?: Nullable<number>
  beneficiary?: Nullable<BeneficiaryPublicSummary>
}

export type HelpRequestDetails = HelpRequestSummary & {
  report?: Nullable<ReportDetails>
  available_actions?: ModerationAction[]
  applicant_contact?: Nullable<ApplicantContact>
  financials?: JsonObject
  donations?: JsonObject
  latitude?: number
  longitude?: number
  additional_notes?: Nullable<string>
  participants?: SocialHelpRequestParticipantsSummary
  relevance_confirmed_at?: Nullable<string>
  started_at?: Nullable<string>
  finished_at?: Nullable<string>
  fund_redistribution_status?: Nullable<string>
  fund_redistributed_amount_kopeks?: Nullable<number>
  approved_at?: Nullable<string>
  approved_by_user_id?: Nullable<string>
  rejected_at?: Nullable<string>
  rejected_by_user_id?: Nullable<string>
  rejection_reason?: Nullable<string>
  returned_at?: Nullable<string>
  returned_by_user_id?: Nullable<string>
  return_reason?: Nullable<string>
  cancelled_at?: Nullable<string>
  cancelled_by_user_id?: Nullable<string>
  cancellation_reason?: Nullable<string>
  cancellation_reason_label?: Nullable<string>
  cancellation_initiator_label?: Nullable<string>
  interrupted_at?: Nullable<string>
  interrupted_by_user_id?: Nullable<string>
  interruption_reason?: Nullable<string>
  interruption_reason_label?: Nullable<string>
  interruption_initiator_label?: Nullable<string>
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

export type ReviewMaterialReportRequest = {
  spent_confirmed_kopeks: number
}

export type ReportDetails = ReportSummary & {
  payload: JsonObject
  available_actions?: ModerationAction[]
  approved_at?: Nullable<string>
  approved_by_user_id?: Nullable<string>
  rejected_at?: Nullable<string>
  rejected_by_user_id?: Nullable<string>
  rejection_reason?: Nullable<string>
  returned_at?: Nullable<string>
  returned_by_user_id?: Nullable<string>
  return_reason?: Nullable<string>
  settlement_reviewed_at?: Nullable<string>
  settlement_reviewed_by_user_id?: Nullable<string>
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
  applicant_contact?: Nullable<ApplicantContact>
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

export type BeneficiaryCategoriesResponse = CodeLabel[]

export type CitiesResponse = CodeLabel[]

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
  queues: PartnerDashboardQueues
}

export type PartnerDashboardQueues = {
  help_requests_pending_moderation: PartnerDashboardSplitCounter
  reports_pending_moderation: PartnerDashboardSplitCounter
  verifications_pending_moderation: PartnerDashboardVerificationCounter
  material_reports_awaiting_settlement_review: number
  complaints_open: number
}

export type AdminDashboardResponse = {
  users_active: number
  users_restricted: number
  users_blocked: number
  staff_admins_active: number
  staff_partners_active: number
  platform_fund_balance_kopeks: number
}

export type AdminUserLookup = {
  user_id: string
  role: string
  phone: Nullable<string>
  email: Nullable<string>
  is_active: boolean
  deleted_at: Nullable<string>
}

export type UserTrustStatus = {
  active_severity_sum: number
  sanction_level: string
  sanction_until: Nullable<string>
  warning_threshold: number
  restrict_threshold: number
  block_threshold: number
  strike_expiry_days: number
}

export type TrustEvent = {
  id: string
  kind: string
  severity: number
  dedupe_key: string
  expires_at: string
  created_at: string
  reference_type: Nullable<string>
  reference_id: Nullable<string>
}

export type UserTrustStatusWithEvents = UserTrustStatus & {
  events: TrustEvent[]
}

export type RecordManualTrustEventRequest = {
  severity: number
  reason: string
}

export type AdminUserComplaintSummary = {
  id: string
  help_request_id: string
  author_user_id: string
  reported_user_id: string
  reason: string
  status: string
  created_at: string
}

export type AdminUserHelpRequestCounts = {
  material_active: number
  material_completed: number
  social_active: number
  social_completed: number
}

export type VolunteerSocialParticipation = JsonObject & {
  help_request_id?: string
  status?: string
}

export type AdminUserCard = {
  user_id: string
  role: string
  is_active: boolean
  deleted_at: Nullable<string>
  phone: Nullable<string>
  email: Nullable<string>
  first_name: Nullable<string>
  last_name: Nullable<string>
  middle_name: Nullable<string>
  verification_status: Nullable<string>
  trust_status: UserTrustStatus
  complaints: AdminUserComplaintSummary[]
  social_participations: VolunteerSocialParticipation[]
  help_request_counts: Nullable<AdminUserHelpRequestCounts>
}

export type StaffMember = {
  user_id: string
  role: string
  email: Nullable<string>
  first_name: string
  last_name: string
  middle_name: Nullable<string>
  is_active: boolean
}

export type ModerationAuditEntry = {
  id: string
  help_request_id: string
  help_request_type: string
  from_status: Nullable<string>
  to_status: string
  changed_at: string
  changed_by_user_id: Nullable<string>
}

export type SkillCatalogAdminItem = {
  code: string
  label: string
  group: string
  group_label: string
  requires_verified: boolean
  is_active: boolean
  sort_order: number
}

export type CreateSkillCatalogItemRequest = {
  code: string
  label: string
  group: string
  group_label: string
  requires_verified?: boolean
  is_active?: boolean
  sort_order?: number
}

export type ComplaintStatus = 'OPEN' | 'UPHELD' | 'REJECTED'

export type Complaint = {
  id: string
  help_request_id: string
  author_user_id: string
  reported_user_id: string
  reason: string
  details: Nullable<string>
  status: ComplaintStatus | string
  reviewed_by_user_id: Nullable<string>
  review_note: Nullable<string>
  created_at: string
  reviewed_at: Nullable<string>
  media_files?: MediaFile[]
}

export type ReviewComplaintRequest = {
  uphold: boolean
  review_note?: Nullable<string>
}

export type PardonUserTrustRequest = {
  note?: Nullable<string>
}

export type VolunteerSkillCatalogItem = {
  code: string
  label: string
  group: string
  requires_verified: boolean
}

export type NotificationEntityType = 'help_request' | 'verification_attempt' | 'help_request_report' | 'complaint'

export type NotificationType =
  | 'help_request.approved'
  | 'help_request.rejected'
  | 'help_request.returned_to_rework'
  | 'help_request.cancelled'
  | 'help_request.interrupted'
  | 'help_request.submitted_for_moderation'
  | 'verification.approved'
  | 'verification.rejected'
  | 'verification.revoked'
  | 'verification.submitted_for_moderation'
  | 'report.approved'
  | 'report.rejected'
  | 'report.returned_to_rework'
  | 'report.submitted_for_moderation'
  | 'social_help_request.relevance_confirmation_required'
  | 'social_help_request.volunteer_joined'
  | 'social_help_request.cancelled'
  | 'social_help_request.execution_started'
  | 'social_help_request.execution_finished'
  | 'donation.received'
  | 'complaint.submitted_for_moderation'
  | 'help_request.funds_redistributed'
  | 'help_request.fund_allocation_received'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string
  entity_type: NotificationEntityType | null
  entity_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export type UnreadNotificationsCountResponse = {
  unread_count: number
}

export type MarkAllNotificationsReadResponse = {
  updated_count: number
}
