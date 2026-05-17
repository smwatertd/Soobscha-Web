import type { ReactNode } from 'react'

type Field = {
  label: string
  value: ReactNode
}

export const FieldGrid = ({ fields }: { fields: Field[] }) => (
  <dl className="field-grid">
    {fields.map((field) => (
      <div key={field.label}>
        <dt>{field.label}</dt>
        <dd>{field.value || '—'}</dd>
      </div>
    ))}
  </dl>
)
