import type { ReactNode } from 'react'
import {
  CalendarOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileImageOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  ReadOutlined,
  SwapOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Button, Card, Drawer, Empty, Space, Tag, Timeline, Typography } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { JsonObject, MediaFile, ReportDetails, VolunteerSkillCatalogItem } from '../types/api'
import { formatDate, formatDistanceKm, formatMoney, truncateId } from '../utils/format'
import { humanizeValue } from '../utils/humanize'
import {
  formatReportHelpRequestType,
  formatReportPayloadValue,
  getPurchasesDescription,
  getReportPayloadEntriesWithoutPurchases,
  getReportPayloadFieldLabel,
  isEmptyReportStatus,
  isMaterialReportItem,
  isReportHistoryItem,
} from '../utils/reportDisplay'
import { FieldGrid, FieldList } from './FieldGrid'
import { ReportStatusBadge } from './ReportStatusBadge'
import { StatusBadge } from './StatusBadge'
import { HumanDataCard } from './HumanDataCard'
import { FinancialSummary } from './FinancialSummary'
import { HistoryVersionDiff } from './HistoryVersionDiff'
import { MediaGrid } from './MediaGrid'

type ValueLabels = Record<string, Record<string, string>>
type VersionField = {
  label: string
  value: ReactNode
  wide?: boolean
}

type HistoryItem = JsonObject & {
  version_number?: number
  status?: string
  created_at?: string
  updated_at?: string
  title?: string
  description?: string
  type?: string
  category?: string
  media_files?: MediaFile[]
  financials?: JsonObject
  donations?: JsonObject
  amount_requested_kopeks?: number
  amount_collected_kopeks?: number
}

type HistoryListProps = {
  items?: HistoryItem[]
  report?: ReportDetails | null
  valueLabels?: ValueLabels
  skillCatalog?: Record<string, VolunteerSkillCatalogItem>
}

export const HistoryList = ({ items, report, valueLabels = {}, skillCatalog = {} }: HistoryListProps) => {
  const [selectedVersion, setSelectedVersion] = useState<HistoryItem | null>(null)
  const [selectedDiff, setSelectedDiff] = useState<{ before: HistoryItem; after: HistoryItem } | null>(null)

  if (!items?.length) {
    return <Empty description="История пока пустая" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <>
      <Timeline
        items={items.map((item, index) => {
          const reworkDiffPair = getReworkDiffPair(items, item)
          const shouldShowReportLink = Boolean(report && isReportRelatedVersion(item))

          return {
            key: `${item.version_number ?? index}-${item.updated_at ?? item.created_at ?? index}`,
            dot: <HistoryOutlined />,
            children: (
              <>
                <Typography.Text strong>Версия {item.version_number ?? index + 1}</Typography.Text>
                <br />
                <Typography.Text type="secondary">{formatDate(item.updated_at ?? item.created_at)}</Typography.Text>
                <div>
                  <StatusBadge status={item.status} />
                  {isMaterialReportItem(item) ? (
                    <>
                      <br />
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Расчёты:{' '}
                        {typeof item.settlement_status === 'string' && item.settlement_status ? (
                          <StatusBadge status={item.settlement_status} />
                        ) : (
                          '—'
                        )}
                      </Typography.Text>
                    </>
                  ) : null}
                </div>
                {item.title ? <Typography.Paragraph>{item.title}</Typography.Paragraph> : null}
                <Space size={8} wrap>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedVersion(item)}>
                    Открыть данные версии
                  </Button>
                  {reworkDiffPair ? (
                    <Button size="small" icon={<SwapOutlined />} onClick={() => setSelectedDiff(reworkDiffPair)}>
                      Изменения после доработки
                    </Button>
                  ) : null}
                  {shouldShowReportLink ? (
                    <Link to={`/reports/${report?.id}`}>
                      <Button size="small" icon={<ReadOutlined />}>
                        Открыть отчёт
                      </Button>
                    </Link>
                  ) : null}
                </Space>
              </>
            ),
          }
        })}
      />
      <Drawer
        title={`Версия ${selectedVersion?.version_number ?? ''}`}
        width={820}
        open={Boolean(selectedVersion)}
        onClose={() => setSelectedVersion(null)}
        destroyOnHidden
      >
        {selectedVersion ? (
          <HistoryVersionDetails
            item={selectedVersion}
            report={report}
            valueLabels={valueLabels}
            skillCatalog={skillCatalog}
          />
        ) : null}
      </Drawer>
      <Drawer
        title="Изменения после доработки"
        width={900}
        open={Boolean(selectedDiff)}
        onClose={() => setSelectedDiff(null)}
        destroyOnHidden
      >
        {selectedDiff ? (
          <HistoryVersionDiff
            before={selectedDiff.before}
            after={selectedDiff.after}
            valueLabels={valueLabels}
          />
        ) : null}
      </Drawer>
    </>
  )
}

const HistoryVersionDetails = ({
  item,
  report,
  valueLabels,
  skillCatalog,
}: {
  item: HistoryItem
  report?: ReportDetails | null
  valueLabels: ValueLabels
  skillCatalog: Record<string, VolunteerSkillCatalogItem>
}) => {
  if (isReportHistoryItem(item)) {
    return (
      <ReportHistoryVersionDetails item={item} />
    )
  }

  const requestFields = compactFields([
    toField('Версия', item.version_number),
    toField('Тип', formatLabeledValue('type', item.type, valueLabels)),
    toField('Категория', formatLabeledValue('category', item.category, valueLabels)),
    toField('Статус', <StatusBadge status={item.status} />),
    toField(
      'Статус отчёта',
      typeof item.report_status === 'string' && !isEmptyReportStatus(item.report_status) ? (
        <ReportStatusBadge status={item.report_status} />
      ) : undefined,
    ),
    toField('Создана', formatDateValue(item.created_at)),
    toField('Обновлена', formatDateValue(item.updated_at)),
    toField('Закрыта', formatDateValue(item.closed_at)),
  ])

  const socialFields = compactFields([
    toField('Минимум волонтёров', item.min_volunteers),
    toField('Максимум волонтёров', item.max_volunteers),
    toField('Начало', formatDateValue(item.start_at)),
    toField('Длительность', formatDuration(item.duration_minutes)),
    toField('Обязательные навыки', renderTagList('required_skills', item.required_skills, valueLabels)),
    toField('Желательные навыки', renderTagList('preferred_skills', item.preferred_skills, valueLabels)),
    toField('Что взять с собой', renderTagList('items_to_bring', item.items_to_bring, valueLabels)),
    toField('Дополнительные заметки', item.additional_notes, { wide: true }),
  ])

  const lifecycleFields = compactFields([
    toField('Актуальность подтверждена', formatDateValue(item.relevance_confirmed_at)),
    toField('Исполнение начато', formatDateValue(item.started_at)),
    toField('Исполнение завершено', formatDateValue(item.finished_at)),
  ])

  const participantFields = getParticipantFields(item.participants)

  const fundRedistributionFields = compactFields([
    toField(
      'Перераспределение фонда',
      typeof item.fund_redistribution_status === 'string' && item.fund_redistribution_status ? (
        <StatusBadge status={item.fund_redistribution_status} />
      ) : undefined,
    ),
    toField(
      'Сумма перераспределения',
      typeof item.fund_redistributed_amount_kopeks === 'number'
        ? formatMoney(item.fund_redistributed_amount_kopeks)
        : undefined,
    ),
  ])

  const geoFields = compactFields([
    toField('Город', formatLabeledValue('city', item.city, valueLabels)),
    toField('Адрес', item.address_text, { wide: true }),
    toField('Место', item.place_name, { wide: true }),
    toField('Расстояние', typeof item.distance_km === 'number' ? formatDistanceKm(item.distance_km) : undefined),
  ])

  const decisionFields = getDecisionFields(item)
  const extraData = getExtraData(item)

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="history-version-card">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space size={10} align="start">
            <span className="section-title-icon">
              <FileTextOutlined />
            </span>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {item.title ?? `Версия ${item.version_number ?? ''}`}
              </Typography.Title>
              <Typography.Text type="secondary">
                Снимок заявки на {formatDateValue(item.updated_at ?? item.created_at)}
              </Typography.Text>
            </div>
          </Space>
          {item.description ? (
            <Typography.Paragraph style={{ margin: 0, lineHeight: 1.65 }}>{item.description}</Typography.Paragraph>
          ) : null}
        </Space>
      </Card>

      {requestFields.length ? (
        <VersionSection icon={<InfoCircleOutlined />} title="Основное">
          <VersionFields fields={requestFields} />
        </VersionSection>
      ) : null}

      {socialFields.length ? (
        <VersionSection icon={<TeamOutlined />} title="Параметры помощи">
          <VersionFields fields={socialFields} />
        </VersionSection>
      ) : null}

      {lifecycleFields.length ? (
        <VersionSection icon={<CalendarOutlined />} title="Жизненный цикл">
          <VersionFields fields={lifecycleFields} />
        </VersionSection>
      ) : null}

      {participantFields.length ? (
        <VersionSection icon={<TeamOutlined />} title="Участники">
          <VersionFields fields={participantFields} />
        </VersionSection>
      ) : null}

      {geoFields.length ? (
        <VersionSection icon={<EnvironmentOutlined />} title="География">
          <VersionFields fields={geoFields} />
        </VersionSection>
      ) : null}

      {decisionFields.length ? (
        <VersionSection icon={<ThunderboltOutlined />} title="Решения и действия">
          <VersionFields fields={decisionFields} />
        </VersionSection>
      ) : null}

      {report && isReportRelatedVersion(item) ? (
        <VersionSection icon={<ReadOutlined />} title="Отчёт">
          <ReportContext report={report} />
        </VersionSection>
      ) : null}

      {isRecord(item.financials) || fundRedistributionFields.length ? (
        <VersionSection icon={<DollarCircleOutlined />} title="Финансы">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {isRecord(item.financials) ? (
              <FinancialSummary
                financials={item.financials}
                donations={item.donations}
                amountRequestedKopeks={item.amount_requested_kopeks}
                amountCollectedKopeks={item.amount_collected_kopeks}
              />
            ) : null}
            {fundRedistributionFields.length ? <VersionFields fields={fundRedistributionFields} /> : null}
          </Space>
        </VersionSection>
      ) : null}

      {item.media_files?.length ? (
        <VersionSection icon={<FileImageOutlined />} title="Медиа">
          <MediaGrid files={item.media_files} />
        </VersionSection>
      ) : null}

      {Object.keys(extraData).length ? (
        <VersionSection icon={<CalendarOutlined />} title="Дополнительные данные версии">
          <HumanDataCard
            value={extraData}
            valueLabels={valueLabels}
            skillCatalog={skillCatalog}
            emptyText="Дополнительных данных нет."
          />
        </VersionSection>
      ) : null}
    </Space>
  )
}

const ReportHistoryVersionDetails = ({ item }: { item: HistoryItem }) => {
  const mainFields = getReportVersionMainFields(item)
  const purchasesDescription = getPurchasesDescription(item.payload)
  const extraPayloadFields = getReportVersionExtraPayloadFields(item)
  const decisionFields = getReportDecisionFields(item)

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="history-version-card">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space size={10} align="start">
            <span className="section-title-icon">
              <FileTextOutlined />
            </span>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Версия {item.version_number ?? ''}
              </Typography.Title>
              <Typography.Text type="secondary">
                Снимок отчёта на {formatDateValue(item.updated_at ?? item.created_at)}
              </Typography.Text>
            </div>
          </Space>
        </Space>
      </Card>

      {mainFields.length || purchasesDescription || extraPayloadFields.length ? (
        <VersionSection icon={<InfoCircleOutlined />} title="Основное">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {mainFields.length ? (
              <FieldGrid
                className="report-version-fields"
                fields={toGridFields(mainFields)}
                column={1}
              />
            ) : null}
            {purchasesDescription ? (
              <div className="report-version-narrative">
                <Typography.Text className="report-version-narrative__label">
                  {getReportPayloadFieldLabel('purchases_description')}
                </Typography.Text>
                <Typography.Paragraph className="report-version-narrative__text">
                  {purchasesDescription}
                </Typography.Paragraph>
              </div>
            ) : null}
            {extraPayloadFields.length ? (
              <FieldGrid className="report-version-fields" fields={extraPayloadFields} column={1} />
            ) : null}
          </Space>
        </VersionSection>
      ) : null}

      {decisionFields.length ? (
        <VersionSection icon={<ThunderboltOutlined />} title="Решения">
          <FieldList fields={toGridFields(decisionFields)} />
        </VersionSection>
      ) : null}

      {item.media_files?.length ? (
        <VersionSection icon={<FileImageOutlined />} title="Медиа">
          <MediaGrid files={item.media_files} />
        </VersionSection>
      ) : null}
    </Space>
  )
}

const getReportVersionMainFields = (item: HistoryItem) =>
  compactFields([
    toField('Версия', item.version_number),
    toField('Статус', <StatusBadge status={item.status} />),
    isMaterialReportItem(item)
      ? toField(
          'Статус расчётов',
          typeof item.settlement_status === 'string' && item.settlement_status ? (
            <StatusBadge status={item.settlement_status} />
          ) : (
            '—'
          ),
        )
      : undefined,
    toField('Тип заявки', formatReportHelpRequestType(item.help_request_type)),
    toField('Подтверждено расходов', formatMoneyValue(item.spent_confirmed_kopeks)),
    toField('Проверка расчётов', formatDateValue(item.settlement_reviewed_at)),
    toField('Создана', formatDateValue(item.created_at)),
    toField('Обновлена', formatDateValue(item.updated_at)),
  ])

const getReportVersionExtraPayloadFields = (item: HistoryItem) =>
  getReportPayloadEntriesWithoutPurchases(item.payload).map(([key, value]) => ({
    label: getReportPayloadFieldLabel(key),
    value: formatReportPayloadValue(key, value),
  }))

const toGridFields = (fields: VersionField[]) =>
  fields.map((field) => ({
    label: field.label,
    value: field.value,
  }))

const getReportDecisionFields = (item: HistoryItem) =>
  compactFields([
    toField('Одобрён', formatDateValue(item.approved_at)),
    toField('Отклонён', formatDateValue(item.rejected_at)),
    toField('Причина отклонения', item.rejection_reason, { wide: true }),
    toField('Возвращён на доработку', formatDateValue(item.returned_at)),
    toField('Причина возврата', item.return_reason, { wide: true }),
  ])

const formatMoneyValue = (value: unknown) => (typeof value === 'number' ? formatMoney(value) : undefined)

const VersionSection = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <Card
    title={
      <Space size={8}>
        <span className="section-title-icon">{icon}</span>
        {title}
      </Space>
    }
  >
    {children}
  </Card>
)

const ReportContext = ({ report }: { report: ReportDetails }) => (
  <Space direction="vertical" size={14} style={{ width: '100%' }}>
    <Typography.Paragraph style={{ margin: 0 }}>
      По этой заявке создан отчёт. Его данные и историю правок лучше смотреть на отдельной странице отчёта.
    </Typography.Paragraph>
    <VersionFields
      fields={compactFields([
        toField('Статус отчёта', <StatusBadge status={report.status} />),
        toField('Расчёты', <StatusBadge status={report.settlement_status ?? undefined} />),
        toField('Подтверждено расходов', formatMoney(report.spent_confirmed_kopeks)),
        toField('Обновлён', formatDateValue(report.updated_at)),
      ])}
    />
    <Link to={`/reports/${report.id}`}>
      <Button type="primary" icon={<ReadOutlined />}>
        Открыть отчёт {truncateId(report.id)}
      </Button>
    </Link>
  </Space>
)

const VersionFields = ({ fields }: { fields: VersionField[] }) => (
  <div className="history-field-grid">
    {fields.map((field) => (
      <div className={field.wide ? 'history-field history-field--wide' : 'history-field'} key={field.label}>
        <Typography.Text className="history-field__label">{field.label}</Typography.Text>
        <div className="history-field__value">{field.value}</div>
      </div>
    ))}
  </div>
)

const getDecisionFields = (item: HistoryItem) =>
  compactFields([
    toField('Одобрена', formatDateValue(item.approved_at)),
    toField('Отклонена', formatDateValue(item.rejected_at)),
    toField('Причина отклонения', item.rejection_reason, { wide: true }),
    toField('Возвращена на доработку', formatDateValue(item.returned_at)),
    toField('Причина возврата', item.return_reason, { wide: true }),
    toField('Отменена', formatDateValue(item.cancelled_at)),
    toField('Инициатор отмены', item.cancellation_initiator_label),
    toField('Причина отмены', item.cancellation_reason_label, { wide: true }),
    toField('Комментарий к отмене', getDistinctText(item.cancellation_reason, item.cancellation_reason_label), { wide: true }),
    toField('Прервана', formatDateValue(item.interrupted_at)),
    toField('Инициатор прерывания', item.interruption_initiator_label),
    toField('Причина прерывания', item.interruption_reason_label, { wide: true }),
    toField(
      'Комментарий к прерыванию',
      getDistinctText(item.interruption_reason, item.interruption_reason_label),
      { wide: true },
    ),
  ])

const getParticipantFields = (participants: unknown) => {
  if (!isRecord(participants)) {
    return []
  }

  return compactFields([
    toField('Всего участников', participants.total),
    toField('Присоединились', participants.joined),
    toField('Присутствовали', participants.attended),
    toField('Не явились', participants.no_show),
    toField('Ушли после начала', participants.left_after_start),
    toField('Отказались', participants.unjoined),
  ])
}

const getDistinctText = (value: unknown, comparedValue: unknown) =>
  typeof value === 'string' && value && value !== comparedValue ? value : undefined

const getReworkDiffPair = (items: HistoryItem[], item: HistoryItem) => {
  const orderedItems = [...items].sort((first, second) => getVersionNumber(first) - getVersionNumber(second))
  const currentIndex = orderedItems.findIndex((orderedItem) => orderedItem === item)

  if (currentIndex < 0) {
    return undefined
  }

  const currentItem = orderedItems[currentIndex]
  const previousItem = orderedItems[currentIndex - 1]

  if (previousItem && isReturnedToReworkVersion(previousItem) && currentItem.status === 'PENDING_MODERATION') {
    return { before: previousItem, after: currentItem }
  }

  return undefined
}

const getVersionNumber = (item: HistoryItem) =>
  typeof item.version_number === 'number' ? item.version_number : Number.MAX_SAFE_INTEGER

const isReturnedToReworkVersion = (item: HistoryItem) =>
  Boolean(item.returned_at || item.return_reason || item.status === 'RETURNED_TO_REWORK')

const isReportRelatedVersion = (item: HistoryItem) =>
  Boolean(
    typeof item.report_status === 'string' ||
      (typeof item.status === 'string' && (item.status.includes('REPORT') || item.status === 'COMPLETED')),
  )

const renderTagList = (key: string, value: unknown, valueLabels: ValueLabels) => {
  if (!Array.isArray(value) || !value.length) {
    return undefined
  }

  return (
    <Space size={[6, 6]} wrap>
      {value.map((item, index) => (
        <Tag key={`${key}-${index}`}>{formatLabeledValue(key, item, valueLabels)}</Tag>
      ))}
    </Space>
  )
}

const formatLabeledValue = (key: string, value: unknown, valueLabels: ValueLabels) => {
  if (!isPresent(value)) {
    return undefined
  }

  if (typeof value === 'string' && valueLabels[key]?.[value]) {
    return valueLabels[key][value]
  }

  return humanizeValue(key, value)
}

const formatDateValue = (value: unknown) => (typeof value === 'string' && value ? formatDate(value) : undefined)

const formatDuration = (value: unknown) => (typeof value === 'number' ? `${value} мин.` : undefined)

const toField = (label: string, value: unknown, options?: { wide?: boolean }): VersionField | undefined =>
  isPresent(value) ? { label, value: value as ReactNode, wide: options?.wide } : undefined

const compactFields = (fields: Array<VersionField | undefined>) =>
  fields.filter((field): field is VersionField => Boolean(field))

const isPresent = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return false
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return true
}

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getExtraData = (item: HistoryItem): JsonObject =>
  Object.fromEntries(Object.entries(item).filter(([key, value]) => !HIDDEN_DETAIL_KEYS.has(key) && isPresent(value)))

const HIDDEN_DETAIL_KEYS = new Set([
  'id',
  'type',
  'title',
  'description',
  'category',
  'status',
  'version_number',
  'created_at',
  'updated_at',
  'closed_at',
  'beneficiary_user_id',
  'amount_requested_kopeks',
  'amount_collected_kopeks',
  'min_volunteers',
  'max_volunteers',
  'start_at',
  'duration_minutes',
  'required_skills',
  'preferred_skills',
  'items_to_bring',
  'additional_notes',
  'report_status',
  'relevance_confirmed_at',
  'started_at',
  'finished_at',
  'participants',
  'fund_redistribution_status',
  'fund_redistributed_amount_kopeks',
  'distance_km',
  'beneficiary',
  'address_text',
  'place_name',
  'city',
  'latitude',
  'longitude',
  'financials',
  'donations',
  'media_files',
  'approved_at',
  'approved_by_user_id',
  'rejected_at',
  'rejected_by_user_id',
  'rejection_reason',
  'returned_at',
  'returned_by_user_id',
  'return_reason',
  'cancelled_at',
  'cancelled_by_user_id',
  'cancellation_reason',
  'cancellation_reason_code',
  'cancellation_reason_label',
  'cancellation_initiator',
  'cancellation_initiator_label',
  'interrupted_at',
  'interrupted_by_user_id',
  'interruption_reason',
  'interruption_reason_code',
  'interruption_reason_label',
  'interruption_initiator',
  'interruption_initiator_label',
  'report_version_id',
  'report_id',
  'help_request_id',
  'help_request_type',
  'settlement_status',
  'settlement_reviewed_at',
  'settlement_reviewed_by_user_id',
  'spent_confirmed_kopeks',
  'payload',
])
