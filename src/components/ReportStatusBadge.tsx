import { Typography } from 'antd'
import { StatusBadge } from './StatusBadge'
import { getReportStatusLabel, isEmptyReportStatus } from '../utils/reportDisplay'

type ReportStatusBadgeProps = {
  status?: string | null
}

export const ReportStatusBadge = ({ status }: ReportStatusBadgeProps) => {
  if (isEmptyReportStatus(status)) {
    return <Typography.Text type="secondary">—</Typography.Text>
  }

  return (
    <StatusBadge
      status={status}
      getLabel={(value) => getReportStatusLabel(value)}
    />
  )
}
