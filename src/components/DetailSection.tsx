import type { ReactNode } from 'react'
import { Card } from 'antd'

type DetailSectionProps = {
  title: ReactNode
  children: ReactNode
}

export const DetailSection = ({ title, children }: DetailSectionProps) => <Card title={title}>{children}</Card>
