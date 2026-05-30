import type { ReactNode } from 'react'
import { Card, Checkbox, Empty, Image, Space, Tag, Typography } from 'antd'
import type { JsonObject, VolunteerSkillCatalogItem } from '../types/api'
import { humanizeKey, humanizeValue } from '../utils/humanize'

type ValueLabels = Record<string, Record<string, string>>

type HumanDataCardProps = {
  value?: JsonObject | null
  emptyText?: string
  valueLabels?: ValueLabels
  skillCatalog?: Record<string, VolunteerSkillCatalogItem>
  hiddenKeys?: string[]
}

export const HumanDataCard = ({
  value,
  emptyText = 'Данных нет.',
  valueLabels = {},
  skillCatalog = {},
  hiddenKeys = [],
}: HumanDataCardProps) => {
  const entries = getVisibleEntries(value, hiddenKeys)

  if (!entries.length) {
    return <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div className="human-data-grid">
      {entries.map(([key, fieldValue]) => renderField(key, fieldValue, valueLabels, skillCatalog))}
    </div>
  )
}

const renderField = (
  key: string,
  value: unknown,
  valueLabels: ValueLabels,
  skillCatalog: Record<string, VolunteerSkillCatalogItem>,
): ReactNode => (
  <div className={getFieldClassName(key, value)} key={key}>
    <Typography.Text className="human-data-label">{humanizeKey(key)}</Typography.Text>
    <div className="human-data-value">{renderValue(key, value, valueLabels, skillCatalog)}</div>
  </div>
)

const renderValue = (
  key: string,
  value: unknown,
  valueLabels: ValueLabels,
  skillCatalog: Record<string, VolunteerSkillCatalogItem>,
): ReactNode => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (Array.isArray(value)) {
    return renderArray(key, value, valueLabels, skillCatalog)
  }

  if (isRecord(value)) {
    return renderObject(value, valueLabels, skillCatalog)
  }

  if (typeof value === 'string' && isUrl(value)) {
    return (
      <Typography.Link href={value} target="_blank" rel="noreferrer">
        Открыть ссылку
      </Typography.Link>
    )
  }

  if (key === 'is_verified' && typeof value === 'boolean') {
    return (
      <Space size={8}>
        <Checkbox checked={value} disabled />
        <Typography.Text>{value ? 'Да' : 'Нет'}</Typography.Text>
      </Space>
    )
  }

  return <Typography.Text>{formatPrimitiveValue(key, value, valueLabels)}</Typography.Text>
}

const renderArray = (
  key: string,
  value: unknown[],
  valueLabels: ValueLabels,
  skillCatalog: Record<string, VolunteerSkillCatalogItem>,
) => {
  if (!value.length) {
    return '—'
  }

  if (value.every((item) => !Array.isArray(item) && !isRecord(item))) {
    return (
      <Space size={[6, 6]} wrap>
        {value.map((item, index) => (
          <Tag key={`${key}-${index}`}>{formatPrimitiveValue(key, item, valueLabels)}</Tag>
        ))}
      </Space>
    )
  }

  if (value.every((item) => isRecord(item) && isMediaObject(item))) {
    return (
      <div className="human-media-grid">
        {value.map((item, index) => (
          <Card size="small" className="human-media-card" key={`${key}-${index}`} title={`Файл ${index + 1}`}>
            {renderMediaObject(item as JsonObject)}
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="human-object-array-grid">
      {value.map((item, index) => (
        <Card size="small" className="human-data-nested-card" title={getArrayItemTitle(key, index)} key={`${key}-${index}`}>
          {renderValue(`${key}_${index}`, item, valueLabels, skillCatalog)}
        </Card>
      ))}
    </div>
  )
}

const renderObject = (
  value: JsonObject,
  valueLabels: ValueLabels,
  skillCatalog: Record<string, VolunteerSkillCatalogItem>,
) => {
  const entries = getVisibleEntries(value)

  if (!entries.length) {
    return '—'
  }

  if (isMediaObject(value)) {
    return renderMediaObject(value)
  }

  if (typeof value.skill_code === 'string') {
    return renderSkillEvidenceObject(value, valueLabels, skillCatalog)
  }

  return (
    <div className="human-data-nested-grid">
      {entries.map(([key, fieldValue]) => renderField(key, fieldValue, valueLabels, skillCatalog))}
    </div>
  )
}

const renderSkillEvidenceObject = (
  value: JsonObject,
  valueLabels: ValueLabels,
  skillCatalog: Record<string, VolunteerSkillCatalogItem>,
) => {
  const code = String(value.skill_code)
  const skill = skillCatalog[code]
  const documents = value.supporting_document_files
  const hasDocuments = Array.isArray(documents) && documents.length > 0
  const skillLabel = skill?.label ?? valueLabels.skill_code?.[code] ?? 'Не удалось загрузить название навыка'

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <div className="skill-evidence-row">
        <Typography.Text className="human-data-label">Название навыка</Typography.Text>
        <Typography.Text strong>{skillLabel}</Typography.Text>
      </div>
      <div className="skill-evidence-row">
        <Typography.Text className="human-data-label">Требует подтверждения</Typography.Text>
        <Space size={8}>
          <Checkbox checked={Boolean(skill?.requires_verified)} indeterminate={!skill} disabled />
          <Typography.Text>{skill ? (skill.requires_verified ? 'Да' : 'Нет') : 'Неизвестно'}</Typography.Text>
        </Space>
      </div>
      {skill?.requires_verified && !hasDocuments ? (
        <Typography.Text type="danger">Подтверждающие документы не приложены.</Typography.Text>
      ) : null}
      {!skill?.requires_verified && hasDocuments ? (
        <Typography.Text type="secondary">Документы приложены дополнительно.</Typography.Text>
      ) : null}
      <div className="human-data-field human-data-field--media">
        <Typography.Text className="human-data-label">Подтверждающие документы</Typography.Text>
        <div className="human-data-value">
          {hasDocuments ? renderValue('supporting_document_files', documents, valueLabels, skillCatalog) : '—'}
        </div>
      </div>
    </Space>
  )
}

const getArrayItemTitle = (key: string, index: number) =>
  key === 'skills_evidence' ? `Навык ${index + 1}` : `${humanizeKey(key)} ${index + 1}`

const renderMediaObject = (value: JsonObject) => (
  <Space direction="vertical" size={8}>
    {getPreviewSource(value) ? (
      <Image
        src={getPreviewSource(value)}
        alt="Превью файла"
        height={150}
        className="human-media-preview"
        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' rx='16' fill='%23edf3fb'/%3E%3Ctext x='160' y='94' text-anchor='middle' fill='%2366758f' font-family='Arial' font-size='16'%3E%D0%A4%D0%B0%D0%B9%D0%BB%3C/text%3E%3C/svg%3E"
      />
    ) : null}
    {typeof value.url === 'string' ? (
      <Typography.Link href={value.url} target="_blank" rel="noreferrer">
        Открыть файл
      </Typography.Link>
    ) : null}
    {typeof value.preview_url === 'string' ? (
      <Typography.Link href={value.preview_url} target="_blank" rel="noreferrer">
        Открыть превью
      </Typography.Link>
    ) : null}
    {typeof value.expires_at === 'string' ? (
      <Typography.Text type="secondary">Ссылка активна до {humanizeValue('expires_at', value.expires_at)}</Typography.Text>
    ) : null}
  </Space>
)

const getPreviewSource = (value: JsonObject) => {
  if (typeof value.preview_url === 'string') {
    return value.preview_url
  }

  if (typeof value.url === 'string') {
    return value.url
  }

  return undefined
}

const formatPrimitiveValue = (key: string, value: unknown, valueLabels: ValueLabels) => {
  if (typeof value === 'string' && valueLabels[key]?.[value]) {
    return valueLabels[key][value]
  }

  return humanizeValue(key, value)
}

const getVisibleEntries = (value?: JsonObject | null, hiddenKeys: string[] = []) => {
  const hidden = new Set(hiddenKeys)

  return value
    ? Object.entries(value).filter(
        ([key, fieldValue]) =>
          !hidden.has(key) && fieldValue !== null && fieldValue !== undefined && fieldValue !== '',
      )
    : []
}

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isUrl = (value: string) => /^https?:\/\//i.test(value)

const isMediaObject = (value: JsonObject) =>
  typeof value.url === 'string' || typeof value.preview_url === 'string' || typeof value.media_id === 'string'

const isMediaValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.some((item) => isRecord(item) && isMediaObject(item))
  }

  return isRecord(value) && isMediaObject(value)
}

const isLongTextField = (key: string, value: unknown) =>
  typeof value === 'string' && (key.includes('description') || value.length > 160)

const getFieldClassName = (key: string, value: unknown) =>
  [
    'human-data-field',
    isMediaValue(value) ? 'human-data-field--media' : '',
    isLongTextField(key, value) ? 'human-data-field--wide' : '',
  ]
    .filter(Boolean)
    .join(' ')
