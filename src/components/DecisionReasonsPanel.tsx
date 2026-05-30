import { Typography } from 'antd'
import type { JsonObject } from '../types/api'
import { formatDate, truncateId } from '../utils/format'
import type { DecisionGroup, DecisionRow } from '../utils/decisionReasons'
import { buildHelpRequestDecisionGroups, buildReportDecisionGroups } from '../utils/decisionReasons'
import { isPartnerInitiator, PARTNER_INITIATOR_LABEL } from '../utils/initiator'
import { UserProfileLink } from './UserProfileLink'

type DecisionReasonsPanelProps = {
  groups: DecisionGroup[]
  emptyText?: string
}

export const DecisionReasonsPanel = ({
  groups,
  emptyText = 'Нет зарегистрированных решений.',
}: DecisionReasonsPanelProps) => {
  if (!groups.length) {
    return <Typography.Text type="secondary">{emptyText}</Typography.Text>
  }

  return (
    <div className="decision-reasons">
      {groups.map((group) => (
        <div key={group.key} className="decision-reason-group">
          <Typography.Text className="decision-reason-group__title">{group.title}</Typography.Text>
          {group.rows.map((row) => (
            <DecisionReasonRow key={`${group.key}-${row.label}`} row={row} />
          ))}
        </div>
      ))}
    </div>
  )
}

export const HelpRequestDecisionReasons = ({ source }: { source: JsonObject }) => (
  <DecisionReasonsPanel
    groups={buildHelpRequestDecisionGroups(source)}
    emptyText="Нет зарегистрированных решений по заявке."
  />
)

export const ReportDecisionReasons = ({ source }: { source: JsonObject }) => (
  <DecisionReasonsPanel
    groups={buildReportDecisionGroups(source)}
    emptyText="Нет зарегистрированных решений по отчёту."
  />
)

const DecisionReasonRow = ({ row }: { row: DecisionRow }) => (
  <div className="decision-reason-row">
    <Typography.Text className="decision-reason-row__label">{row.label}</Typography.Text>
    <div className="decision-reason-row__value">{renderRowValue(row)}</div>
  </div>
)

const renderRowValue = (row: DecisionRow) => {
  if (row.label === 'Инициатор') {
    return renderInitiatorValue(row)
  }

  if (row.userId && !row.value) {
    return (
      <UserProfileLink userId={row.userId}>
        {truncateId(row.userId)}
      </UserProfileLink>
    )
  }

  if (row.userId && row.value) {
    return (
      <>
        <span>{row.value}</span>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          <UserProfileLink userId={row.userId}>{truncateId(row.userId)}</UserProfileLink>
        </Typography.Text>
      </>
    )
  }

  if (row.label === 'Дата и время' && row.value) {
    return formatDate(row.value)
  }

  return row.value ?? '—'
}

const renderInitiatorValue = (row: DecisionRow) => {
  if (row.isModerationActor || isPartnerInitiator(row.initiatorCode, row.value)) {
    return PARTNER_INITIATOR_LABEL
  }

  if (row.value && row.userId) {
    return (
      <>
        <span>{row.value}</span>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          <UserProfileLink userId={row.userId}>{truncateId(row.userId)}</UserProfileLink>
        </Typography.Text>
      </>
    )
  }

  if (row.value) {
    return row.value
  }

  if (row.userId) {
    return (
      <UserProfileLink userId={row.userId}>
        {truncateId(row.userId)}
      </UserProfileLink>
    )
  }

  return '—'
}
