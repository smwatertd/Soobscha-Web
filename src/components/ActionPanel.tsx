import { useState } from 'react'
import { CheckCircleOutlined, CloseCircleOutlined, RollbackOutlined, StopOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Space, Typography } from 'antd'
import type { CodeLabel, ModerationAction } from '../types/api'
import { ACTION_LABELS, normalizeAction } from '../utils/labels'
import { ReasonModal } from './ReasonModal'

type ActionPanelProps = {
  actions?: ModerationAction[]
  fallbackActions?: string[]
  reasonCodeOptions?: Partial<Record<string, CodeLabel[]>>
  onApprove?: () => Promise<void>
  onReasonAction?: (action: string, reason: string, code?: string) => Promise<void>
  subject?: string
}

const REASON_ACTIONS = ['reject', 'return_to_rework', 'return-to-rework', 'cancel', 'interrupt', 'revoke']

export const ActionPanel = ({
  actions,
  fallbackActions = [],
  reasonCodeOptions = {},
  onApprove,
  onReasonAction,
  subject = 'сущности',
}: ActionPanelProps) => {
  const availableActions = (actions?.length ? actions : fallbackActions).map((action) => normalizeAction(String(action)))
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState('')

  if (!availableActions.length) {
    return <Typography.Text type="secondary">Для текущего статуса нет доступных действий.</Typography.Text>
  }

  const approve = async () => {
    if (!onApprove) {
      return
    }

    setIsApproving(true)
    setError('')

    try {
      await onApprove()
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Не удалось одобрить')
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        {availableActions.map((action) =>
          action === 'approve' ? (
            <Button
              key={action}
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={approve}
              loading={isApproving}
              disabled={!onApprove}
            >
              {ACTION_LABELS[action]}
            </Button>
          ) : REASON_ACTIONS.includes(action) ? (
            <Button
              key={action}
              icon={getActionIcon(action)}
              onClick={() => setPendingAction(action)}
              danger={action === 'reject' || action === 'revoke'}
            >
              {ACTION_LABELS[action] ?? action}
            </Button>
          ) : null,
        )}
      </Space>
      {error ? <Alert type="error" message={error} showIcon /> : null}
      {pendingAction ? (
        <ReasonModal
          title={ACTION_LABELS[pendingAction] ?? pendingAction}
          submitLabel={ACTION_LABELS[pendingAction] ?? 'Подтвердить'}
          action={pendingAction}
          code={reasonCodeOptions[pendingAction]?.[0]?.code}
          codeOptions={reasonCodeOptions[pendingAction]}
          onClose={() => setPendingAction(null)}
          onSubmit={async (reason, code) => {
            await (onReasonAction?.(pendingAction, reason, code) ?? Promise.resolve())
          }}
        />
      ) : null}
    </Space>
  )
}

const getActionIcon = (action: string) => {
  if (action === 'reject') {
    return <CloseCircleOutlined />
  }

  if (action === 'return_to_rework' || action === 'return-to-rework') {
    return <RollbackOutlined />
  }

  if (action === 'cancel' || action === 'interrupt' || action === 'revoke') {
    return <StopOutlined />
  }

  return <WarningOutlined />
}
