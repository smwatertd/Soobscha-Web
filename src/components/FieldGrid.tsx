import type { ReactNode } from 'react'
import { Descriptions } from 'antd'

type Field = {
  label: string
  value: ReactNode
}

const DEFAULT_COLUMNS: NonNullable<Parameters<typeof Descriptions>[0]['column']> = {
  xxl: 2,
  xl: 2,
  lg: 2,
  md: 2,
  sm: 2,
  xs: 1,
}

export const FieldGrid = ({
  fields,
  column = DEFAULT_COLUMNS,
  className,
}: {
  fields: Field[]
  column?: Parameters<typeof Descriptions>[0]['column']
  className?: string
}) => (
  <Descriptions bordered size="small" column={column} className={className} items={toItems(fields)} />
)

export const FieldList = ({ fields }: { fields: Field[] }) => (
  <Descriptions bordered size="small" column={1} layout="horizontal" items={toItems(fields)} />
)

const toItems = (fields: Field[]) =>
  fields.map((field) => ({
    key: field.label,
    label: field.label,
    children: field.value || '—',
  }))
