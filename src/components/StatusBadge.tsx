import { Tag } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  RollbackOutlined,
  SyncOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { labelOrValue, ENUM_LABELS } from '../utils/labels'
import { humanizeKey } from '../utils/humanize'

const getStatusLabel = (status: string) => labelOrValue(ENUM_LABELS, status) ?? humanizeKey(status)

const getTone = (status: string) => {
  if (['APPROVED', 'COMPLETED', 'FUNDED', 'COLLECTING_FUNDS', 'UPHELD'].includes(status)) {
    return 'success' as const
  }

  if (['REJECTED', 'CANCELLED', 'INTERRUPTED', 'REVOKED', 'REPORT_OVERDUE'].includes(status)) {
    return 'error' as const
  }

  if (['RETURNED_TO_REWORK', 'WAITING_REPORT', 'WAITING_START', 'OPEN'].includes(status)) {
    return 'warning' as const
  }

  return 'default' as const
}

const getIcon = (status: string) => {
  if (['APPROVED', 'COMPLETED', 'FUNDED', 'EXPENSES_VERIFIED'].includes(status)) {
    return <CheckCircleOutlined />
  }

  if (['REJECTED', 'CANCELLED', 'INTERRUPTED', 'REVOKED'].includes(status)) {
    return <CloseCircleOutlined />
  }

  if (['RETURNED_TO_REWORK'].includes(status)) {
    return <RollbackOutlined />
  }

  if (['COLLECTING_FUNDS', 'AWAITING_REFUND'].includes(status)) {
    return <DollarCircleOutlined />
  }

  if (['VOLUNTEER_RECRUITING'].includes(status)) {
    return <TeamOutlined />
  }

  if (['REPORT_ON_REVIEW', 'REPORT_ON_MODERATION', 'WAITING_REPORT'].includes(status)) {
    return <FileSearchOutlined />
  }

  if (['WAITING_RELEVANCE_CONFIRMATION', 'WAITING_START', 'PENDING_MODERATION'].includes(status)) {
    return <ClockCircleOutlined />
  }

  if (['IN_PROGRESS'].includes(status)) {
    return <SyncOutlined spin />
  }

  if (['REPORT_OVERDUE'].includes(status)) {
    return <WarningOutlined />
  }

  return <ExclamationCircleOutlined />
}

export const StatusBadge = ({
  status,
  getLabel = getStatusLabel,
}: {
  status?: string | null
  getLabel?: (status: string) => string
}) => {
  if (!status) {
    return <Tag>—</Tag>
  }

  return (
    <Tag color={getTone(status)} icon={getIcon(status)}>
      {getLabel(status)}
    </Tag>
  )
}
