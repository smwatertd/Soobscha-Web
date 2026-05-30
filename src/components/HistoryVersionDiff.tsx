import { CheckCircleOutlined, FileImageOutlined, InfoCircleOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, Empty, Space, Tag, Typography } from 'antd'
import type { ReactNode } from 'react'
import type { JsonObject, MediaFile } from '../types/api'
import { formatDate, formatMoney } from '../utils/format'
import { humanizeValue } from '../utils/humanize'
import { StatusBadge } from './StatusBadge'
import { MediaGrid } from './MediaGrid'

type ValueLabels = Record<string, Record<string, string>>

type HistoryItem = JsonObject & {
  version_number?: number
  title?: string
  description?: string
  type?: string
  category?: string
  status?: string
  financials?: JsonObject
  media_files?: MediaFile[]
}

type DiffField = {
  label: string
  before: ReactNode
  after: ReactNode
  changed: boolean
  wide?: boolean
}

type DiffSection = {
  title: string
  icon: ReactNode
  fields: DiffField[]
}

export const HistoryVersionDiff = ({
  before,
  after,
  valueLabels = {},
}: {
  before: HistoryItem
  after: HistoryItem
  valueLabels?: ValueLabels
}) => {
  const sections = getDiffSections(before, after, valueLabels).filter((section) =>
    section.fields.some((field) => field.changed),
  )
  const mediaDiff = getMediaDiff(before.media_files, after.media_files)

  if (!sections.length && !mediaDiff.added.length && !mediaDiff.removed.length) {
    return <Empty description="Изменений между версиями не найдено" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="version-diff-summary">
        <Space direction="vertical" size={4}>
          <Typography.Text strong>
            Версия {before.version_number ?? '—'} → версия {after.version_number ?? '—'}
          </Typography.Text>
          <Typography.Text type="secondary">
            Показываем только важные для партнёра изменения после доработки заявки.
          </Typography.Text>
        </Space>
      </Card>

      {sections.map((section) => (
        <Card
          key={section.title}
          title={
            <Space size={8}>
              <span className="section-title-icon">{section.icon}</span>
              {section.title}
            </Space>
          }
        >
          <div className="version-diff-grid">
            {section.fields
              .filter((field) => field.changed)
              .map((field) => (
                <div className={field.wide ? 'version-diff-field version-diff-field--wide' : 'version-diff-field'} key={field.label}>
                  <Typography.Text className="version-diff-field__label">{field.label}</Typography.Text>
                  <div className="version-diff-columns">
                    <DiffValue title="Было" type="before" value={field.before} />
                    <DiffValue title="Стало" type="after" value={field.after} />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}

      {mediaDiff.added.length || mediaDiff.removed.length ? (
        <Card
          title={
            <Space size={8}>
              <span className="section-title-icon">
                <FileImageOutlined />
              </span>
              Медиа
            </Space>
          }
        >
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            {mediaDiff.added.length ? (
              <div>
                <Typography.Title level={5}>Добавлены файлы</Typography.Title>
                <MediaGrid files={mediaDiff.added} />
              </div>
            ) : null}
            {mediaDiff.removed.length ? (
              <div>
                <Typography.Title level={5}>Удалены файлы</Typography.Title>
                <MediaGrid files={mediaDiff.removed} />
              </div>
            ) : null}
          </Space>
        </Card>
      ) : null}
    </Space>
  )
}

const DiffValue = ({ title, type, value }: { title: string; type: 'before' | 'after'; value: ReactNode }) => (
  <div className={`version-diff-value version-diff-value--${type}`}>
    <Typography.Text className="version-diff-value__title">{title}</Typography.Text>
    <div className="version-diff-value__content">{value || '—'}</div>
  </div>
)

const getDiffSections = (before: HistoryItem, after: HistoryItem, valueLabels: ValueLabels): DiffSection[] => [
  {
    title: 'Основное',
    icon: <InfoCircleOutlined />,
    fields: [
      diffField('Название', before.title, after.title, { wide: true }),
      diffField('Описание', before.description, after.description, { wide: true }),
      diffField('Тип', before.type, after.type, { format: (value) => formatLabeledValue('type', value, valueLabels) }),
      diffField('Категория', before.category, after.category, {
        format: (value) => formatLabeledValue('category', value, valueLabels),
      }),
      diffField('Статус', before.status, after.status, { format: (value) => <StatusBadge status={stringValue(value)} /> }),
    ],
  },
  {
    title: 'Параметры помощи',
    icon: <TeamOutlined />,
    fields: [
      diffField('Минимум волонтёров', before.min_volunteers, after.min_volunteers),
      diffField('Максимум волонтёров', before.max_volunteers, after.max_volunteers),
      diffField('Начало', before.start_at, after.start_at, { format: formatDateValue }),
      diffField('Длительность', before.duration_minutes, after.duration_minutes, { format: formatDuration }),
      diffField('Обязательные навыки', before.required_skills, after.required_skills, {
        format: (value) => renderTags('required_skills', value, valueLabels),
        wide: true,
      }),
      diffField('Желательные навыки', before.preferred_skills, after.preferred_skills, {
        format: (value) => renderTags('preferred_skills', value, valueLabels),
        wide: true,
      }),
      diffField('Адрес', before.address_text, after.address_text, { wide: true }),
      diffField('Место', before.place_name, after.place_name, { wide: true }),
    ],
  },
  {
    title: 'Финансы',
    icon: <CheckCircleOutlined />,
    fields: [
      diffField('Запрошено', getFinancialValue(before, 'requested_kopeks'), getFinancialValue(after, 'requested_kopeks'), {
        format: formatMoneyValue,
      }),
      diffField('Собрано', getFinancialValue(before, 'collected_kopeks'), getFinancialValue(after, 'collected_kopeks'), {
        format: formatMoneyValue,
      }),
      diffField(
        'Осталось собрать',
        getFinancialValue(before, 'remaining_to_collect_kopeks'),
        getFinancialValue(after, 'remaining_to_collect_kopeks'),
        { format: formatMoneyValue },
      ),
    ],
  },
  {
    title: 'Решения и действия',
    icon: <PlusOutlined />,
    fields: [
      diffField('Причина возврата', before.return_reason, after.return_reason, { wide: true }),
      diffField('Отменена', before.cancelled_at, after.cancelled_at, { format: formatDateValue }),
      diffField('Инициатор отмены', before.cancellation_initiator_label, after.cancellation_initiator_label),
      diffField('Причина отмены', before.cancellation_reason_label, after.cancellation_reason_label, { wide: true }),
      diffField('Комментарий к отмене', before.cancellation_reason, after.cancellation_reason, { wide: true }),
    ],
  },
]

const diffField = (
  label: string,
  before: unknown,
  after: unknown,
  options?: { format?: (value: unknown) => ReactNode; wide?: boolean },
): DiffField => ({
  label,
  before: options?.format ? options.format(before) : formatPrimitive(before),
  after: options?.format ? options.format(after) : formatPrimitive(after),
  changed: !isEqualValue(before, after),
  wide: options?.wide,
})

const getFinancialValue = (item: HistoryItem, key: string) =>
  isRecord(item.financials) ? item.financials[key] : item[key]

const getMediaDiff = (before?: MediaFile[], after?: MediaFile[]) => {
  const beforeFiles = before ?? []
  const afterFiles = after ?? []
  const beforeKeys = new Set(beforeFiles.map(getMediaKey))
  const afterKeys = new Set(afterFiles.map(getMediaKey))

  return {
    added: afterFiles.filter((file) => !beforeKeys.has(getMediaKey(file))),
    removed: beforeFiles.filter((file) => !afterKeys.has(getMediaKey(file))),
  }
}

const getMediaKey = (file: MediaFile) => file.media_id || file.url

const renderTags = (key: string, value: unknown, valueLabels: ValueLabels) => {
  if (!Array.isArray(value) || !value.length) {
    return '—'
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
  if (typeof value === 'string' && valueLabels[key]?.[value]) {
    return valueLabels[key][value]
  }

  return humanizeValue(key, value)
}

const formatPrimitive = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return humanizeValue('', value)
}

const formatDateValue = (value: unknown) => (typeof value === 'string' && value ? formatDate(value) : '—')

const formatDuration = (value: unknown) => (typeof value === 'number' ? `${value} мин.` : '—')

const formatMoneyValue = (value: unknown) => formatMoney(typeof value === 'number' ? value : undefined)

const stringValue = (value: unknown) => (typeof value === 'string' ? value : undefined)

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isEqualValue = (before: unknown, after: unknown) => JSON.stringify(normalizeValue(before)) === JSON.stringify(normalizeValue(after))

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return [...value].sort()
  }

  return value ?? null
}
