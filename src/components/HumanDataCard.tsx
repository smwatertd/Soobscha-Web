import type { JsonObject } from '../types/api'
import { objectToHumanFields } from '../utils/humanize'

type HumanDataCardProps = {
  value?: JsonObject | null
  emptyText?: string
}

export const HumanDataCard = ({ value, emptyText = 'Данных нет.' }: HumanDataCardProps) => {
  const fields = objectToHumanFields(value)

  if (!fields.length) {
    return <p className="muted">{emptyText}</p>
  }

  return (
    <div className="human-data-grid">
      {fields.map((field) => (
        <div key={field.key} className="human-data-item">
          <span>{field.label}</span>
          <strong>{field.value}</strong>
        </div>
      ))}
    </div>
  )
}
