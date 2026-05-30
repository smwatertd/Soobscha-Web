import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  DollarCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  PictureOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Button, Col, Row, Space, Tag, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { helpRequestsApi } from '../api/endpoints'
import { ActionPanel } from '../components/ActionPanel'
import { ApplicantContactsPanel } from '../components/ApplicantContactsPanel'
import { CoordinatesQualityAlert } from '../components/CoordinatesQualityAlert'
import { DetailSection } from '../components/DetailSection'
import { HelpRequestDecisionReasons } from '../components/DecisionReasonsPanel'
import { FieldGrid } from '../components/FieldGrid'
import { FinancialSummary } from '../components/FinancialSummary'
import { HistoryList } from '../components/HistoryList'
import { MediaGrid } from '../components/MediaGrid'
import { PageHeader } from '../components/PageHeader'
import { SocialRequestLocationMap } from '../components/SocialRequestLocationMap'
import { StateBlock } from '../components/StateBlock'
import { ReportStatusBadge } from '../components/ReportStatusBadge'
import { StatusBadge } from '../components/StatusBadge'
import { UserProfileLink } from '../components/UserProfileLink'
import { useHelpRequestCategories } from '../hooks/useHelpRequestCategories'
import { useCities } from '../hooks/useCities'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import { useVolunteerSkillCatalog } from '../hooks/useVolunteerSkillCatalog'
import type { CodeLabel, HelpRequestDetails, HelpRequestReasonCodesResponse, HelpRequestVersion } from '../types/api'
import { formatDate, formatDistanceKm, formatMoney, getErrorMessage, truncateId } from '../utils/format'
import { getBeneficiaryDisplayName } from '../utils/beneficiary'
import {
  CANCELLATION_REASON_CODES,
  codeLabelsToMap,
  HELP_REQUEST_TYPES,
  INTERRUPTION_REASON_CODES,
  labelOrValue,
  mergeCodeLabels,
} from '../utils/labels'

export const RequestDetailsPage = () => {
  const { id } = useParams()
  const [request, setRequest] = useState<HelpRequestDetails | null>(null)
  const [history, setHistory] = useState<HelpRequestVersion[]>([])
  const [reasonCodes, setReasonCodes] = useState<HelpRequestReasonCodesResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const categoryLabels = useHelpRequestCategories()
  const cityLabels = useCities()
  const skillLabels = useVolunteerSkillCatalog()

  const load = useCallback(
    async (silent = false) => {
      if (!id) {
        return
      }

      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const [requestResponse, historyResponse] = await Promise.all([
          helpRequestsApi.get(id),
          helpRequestsApi.history(id).catch(() => []),
        ])
        setRequest(requestResponse)
        setHistory(historyResponse)
        helpRequestsApi.reasonCodes().then(setReasonCodes).catch(() => setReasonCodes(null))
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [id],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  if (isLoading) {
    return <StateBlock title="Загружаем заявку..." />
  }

  if (error || !request || !id) {
    return <StateBlock title="Не удалось открыть заявку" description={error} />
  }

  const fallbackActions = request.status === 'PENDING_MODERATION' ? ['approve', 'reject', 'return_to_rework'] : []
  const typedReasonCodes = getReasonCodesForType(request.type, reasonCodes)
  const currentVersion = history.length ? history[history.length - 1] : null
  const historyValueLabels = {
    category: categoryLabels,
    required_skills: skillLabels,
    preferred_skills: skillLabels,
    cancellation_reason_code: mergeCodeLabels(
      CANCELLATION_REASON_CODES,
      codeLabelsToMap(typedReasonCodes?.cancellation),
    ),
    interruption_reason_code: mergeCodeLabels(
      INTERRUPTION_REASON_CODES,
      codeLabelsToMap(typedReasonCodes?.interruption),
    ),
    cancellation_reason: mergeCodeLabels(
      CANCELLATION_REASON_CODES,
      codeLabelsToMap(typedReasonCodes?.cancellation),
    ),
    interruption_reason: mergeCodeLabels(
      INTERRUPTION_REASON_CODES,
      codeLabelsToMap(typedReasonCodes?.interruption),
    ),
  }

  return (
    <>
      <PageHeader
        icon={<FileTextOutlined />}
        title={request.title}
        description={`Заявка ${truncateId(request.id)} · ${labelOrValue(HELP_REQUEST_TYPES, request.type)}`}
        actions={
          <Link to="/requests">
            <Button>К списку</Button>
          </Link>
        }
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Основная информация" />}>
              {currentVersion?.version_number ? (
                <Space style={{ marginBottom: 12 }} wrap>
                  <Tag color="blue">Текущая версия v{currentVersion.version_number}</Tag>
                  <StatusBadge status={request.status} />
                </Space>
              ) : null}
              <FieldGrid
                fields={[
                  { label: 'Статус', value: <StatusBadge status={request.status} /> },
                  { label: 'Статус отчёта', value: <ReportStatusBadge status={request.report_status} /> },
                  { label: 'Тип', value: labelOrValue(HELP_REQUEST_TYPES, request.type) },
                  { label: 'Категория', value: labelOrValue(categoryLabels, request.category) },
                  {
                    label: 'Бенефициар',
                    value: (
                      <UserProfileLink userId={request.beneficiary_user_id}>
                        {getBeneficiaryDisplayName(request)}
                      </UserProfileLink>
                    ),
                  },
                  ...(request.beneficiary
                    ? [
                        { label: 'Возраст бенефициара', value: request.beneficiary.age ?? '—' },
                        {
                          label: 'Город бенефициара',
                          value: labelOrValue(cityLabels, request.beneficiary.city),
                        },
                        {
                          label: 'Категория бенефициара',
                          value: labelOrValue(categoryLabels, request.beneficiary.base_category),
                        },
                      ]
                    : []),
                  { label: 'Создана', value: formatDate(request.created_at) },
                  { label: 'Обновлена', value: formatDate(request.updated_at) },
                ]}
              />
              <Typography.Paragraph style={{ margin: '18px 0 0', lineHeight: 1.6 }}>
                {request.description}
              </Typography.Paragraph>
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<PhoneOutlined />} label="Контакты для связи" />}>
              <ApplicantContactsPanel contact={request.applicant_contact} />
            </DetailSection>
            <DetailSection
              title={
                <SectionTitle
                  icon={request.type === 'MATERIAL' ? <DollarCircleOutlined /> : <EnvironmentOutlined />}
                  label={request.type === 'MATERIAL' ? 'Финансы' : 'Параметры работ и место'}
                />
              }
            >
              {request.type === 'MATERIAL' ? (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <FinancialSummary
                    financials={request.financials}
                    donations={request.donations}
                    amountRequestedKopeks={request.amount_requested_kopeks}
                    amountCollectedKopeks={request.amount_collected_kopeks}
                  />
                  {request.fund_redistribution_status || request.fund_redistributed_amount_kopeks != null ? (
                    <FieldGrid
                      fields={[
                        {
                          label: 'Перераспределение фонда',
                          value: request.fund_redistribution_status ? (
                            <StatusBadge status={request.fund_redistribution_status} />
                          ) : (
                            '—'
                          ),
                        },
                        {
                          label: 'Сумма перераспределения',
                          value: formatMoney(request.fund_redistributed_amount_kopeks),
                        },
                      ]}
                    />
                  ) : null}
                </Space>
              ) : (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <FieldGrid
                    fields={[
                      { label: 'Волонтёры', value: `${request.min_volunteers ?? '—'}-${request.max_volunteers ?? '—'}` },
                      { label: 'Начало', value: formatDate(request.start_at) },
                      { label: 'Длительность', value: request.duration_minutes ? `${request.duration_minutes} мин.` : '—' },
                      { label: 'Адрес', value: request.address_text ?? request.place_name ?? '—' },
                      { label: 'Расстояние', value: formatDistanceKm(request.distance_km) },
                      { label: 'Обязательные навыки', value: formatCodes(request.required_skills, skillLabels) },
                      { label: 'Желательные навыки', value: formatCodes(request.preferred_skills, skillLabels) },
                      {
                        label: 'Что взять с собой',
                        value: request.items_to_bring?.length ? request.items_to_bring.join(', ') : '—',
                      },
                      { label: 'Дополнительные заметки', value: request.additional_notes ?? '—' },
                    ]}
                  />
                  {request.participants ? (
                    <FieldGrid
                      fields={[
                        { label: 'Всего участников', value: request.participants.total },
                        { label: 'Присоединились', value: request.participants.joined },
                        { label: 'Присутствовали', value: request.participants.attended },
                        { label: 'Не явились', value: request.participants.no_show },
                        { label: 'Ушли после начала', value: request.participants.left_after_start },
                        { label: 'Отказались', value: request.participants.unjoined },
                      ]}
                    />
                  ) : null}
                  {(request.relevance_confirmed_at || request.started_at || request.finished_at) && (
                    <FieldGrid
                      fields={[
                        { label: 'Актуальность подтверждена', value: formatDate(request.relevance_confirmed_at) },
                        { label: 'Исполнение начато', value: formatDate(request.started_at) },
                        { label: 'Исполнение завершено', value: formatDate(request.finished_at) },
                      ]}
                    />
                  )}
                  <SocialRequestLocationMap
                    latitude={request.latitude}
                    longitude={request.longitude}
                    addressLine={request.address_text ?? request.place_name}
                  />
                  <CoordinatesQualityAlert
                    latitude={request.latitude}
                    longitude={request.longitude}
                    address={request.address_text ?? request.place_name}
                  />
                </Space>
              )}
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<PictureOutlined />} label="Медиа" />}>
              <MediaGrid files={request.media_files} />
            </DetailSection>
            <DetailSection
              title={
                <SectionTitle
                  icon={<HistoryOutlined />}
                  label={history.length > 1 ? 'История версий' : 'История'}
                />
              }
            >
              {history.length > 1 ? (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  Хронология изменений заявки. В более ранних версиях видны правки бенефициара и решения партнёра.
                </Typography.Paragraph>
              ) : null}
              <HistoryList
                items={history}
                report={request.report}
                valueLabels={historyValueLabels}
              />
            </DetailSection>
          </Space>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<ThunderboltOutlined />} label="Действия" />}>
              <ActionPanel
                actions={request.available_actions}
                subject={`заявки ${truncateId(request.id)}`}
                fallbackActions={fallbackActions}
                reasonCodeOptions={{
                  cancel: typedReasonCodes?.cancellation,
                  interrupt: typedReasonCodes?.interruption,
                }}
                onApprove={async () => {
                  setRequest(await helpRequestsApi.approve(id))
                  await load()
                }}
                onReasonAction={async (action, reason, code) => {
                  if (action === 'reject') {
                    setRequest(await helpRequestsApi.reject(id, { reason }))
                  }

                  if (action === 'return_to_rework' || action === 'return-to-rework') {
                    setRequest(await helpRequestsApi.returnToRework(id, { reason }))
                  }

                  if (action === 'cancel') {
                    setRequest(await helpRequestsApi.cancel(id, { reason, code }))
                  }

                  if (action === 'interrupt') {
                    setRequest(await helpRequestsApi.interrupt(id, { reason, code }))
                  }

                  await load()
                }}
              />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Причины решений" />}>
              <HelpRequestDecisionReasons source={request} />
            </DetailSection>
          </Space>
        </Col>
      </Row>
    </>
  )
}

const getReasonCodesForType = (type: string, reasonCodes: HelpRequestReasonCodesResponse | null) => {
  if (!reasonCodes) {
    return undefined
  }

  const codes = type === 'MATERIAL' ? reasonCodes.material : reasonCodes.social

  return {
    cancellation: withPartnerFallback(codes.cancellation),
    interruption: withPartnerFallback(codes.interruption),
  }
}

const withPartnerFallback = (codes: CodeLabel[]) =>
  codes.length ? codes : [{ code: 'PARTNER_MANUAL', label: 'Решение партнёра' }]

const formatCodes = (codes: string[] | undefined, labels: Record<string, string>) =>
  codes?.length ? codes.map((code) => labels[code] ?? code).join(', ') : '—'

const SectionTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={8}>
    <span className="section-title-icon">{icon}</span>
    {label}
  </Space>
)
