import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CodeLabel } from '../types/api'

type ReasonModalProps = {
  title: string
  submitLabel: string
  code?: string
  codeOptions?: CodeLabel[]
  onSubmit: (reason: string, code?: string) => Promise<void>
  onClose: () => void
}

export const ReasonModal = ({ title, submitLabel, code, codeOptions = [], onSubmit, onClose }: ReasonModalProps) => {
  const [selectedCode, setSelectedCode] = useState(codeOptions[0]?.code ?? code)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (reason.trim().length < 3) {
      setError('Укажите причину минимум из 3 символов')

      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(reason.trim(), selectedCode)
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось выполнить действие')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" onSubmit={handleSubmit}>
        <h2>{title}</h2>
        {codeOptions.length ? (
          <label>
            Тип причины
            <select value={selectedCode ?? ''} onChange={(event) => setSelectedCode(event.target.value)}>
              {codeOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Причина
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={5} autoFocus />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="modal__actions">
          <button type="button" className="button secondary" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </button>
          <button type="submit" className="button danger" disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
