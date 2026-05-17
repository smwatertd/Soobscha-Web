import { useState } from 'react'
import type { CodeLabel, ModerationAction } from '../types/api'
import { ACTION_LABELS, normalizeAction } from '../utils/labels'
import { ReasonModal } from './ReasonModal'

type ActionPanelProps = {
  actions?: ModerationAction[]
  fallbackActions?: string[]
  reasonCodeOptions?: Partial<Record<string, CodeLabel[]>>
  onApprove?: () => Promise<void>
  onReasonAction?: (action: string, reason: string, code?: string) => Promise<void>
}

const REASON_ACTIONS = ['reject', 'return_to_rework', 'return-to-rework', 'cancel', 'interrupt']

export const ActionPanel = ({
  actions,
  fallbackActions = [],
  reasonCodeOptions = {},
  onApprove,
  onReasonAction,
}: ActionPanelProps) => {
  const availableActions = (actions?.length ? actions : fallbackActions).map((action) => normalizeAction(String(action)))
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState('')

  if (!availableActions.length) {
    return <p className="muted">Для текущего статуса нет доступных действий.</p>
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
    <div className="action-panel">
      <div className="action-panel__buttons">
        {availableActions.map((action) =>
          action === 'approve' ? (
            <button key={action} className="button success" onClick={approve} disabled={isApproving || !onApprove}>
              {isApproving ? 'Одобряем...' : ACTION_LABELS[action]}
            </button>
          ) : REASON_ACTIONS.includes(action) ? (
            <button key={action} className="button secondary" onClick={() => setPendingAction(action)}>
              {ACTION_LABELS[action] ?? action}
            </button>
          ) : null,
        )}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {pendingAction ? (
        <ReasonModal
          title={ACTION_LABELS[pendingAction] ?? pendingAction}
          submitLabel={ACTION_LABELS[pendingAction] ?? 'Подтвердить'}
          code={reasonCodeOptions[pendingAction]?.[0]?.code}
          codeOptions={reasonCodeOptions[pendingAction]}
          onClose={() => setPendingAction(null)}
          onSubmit={(reason, code) => onReasonAction?.(pendingAction, reason, code) ?? Promise.resolve()}
        />
      ) : null}
    </div>
  )
}
