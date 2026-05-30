import type { ReactNode } from 'react'
import { Flex, Space, Typography } from 'antd'

type PageHeaderProps = {
  icon?: ReactNode
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export const PageHeader = ({ icon, title, description, actions }: PageHeaderProps) => (
  <Flex justify="space-between" align="flex-start" gap={24} wrap style={{ marginBottom: 28 }}>
    <Space align="start" size={14}>
      {icon ? <span className="page-title-icon">{icon}</span> : null}
      <div>
        <Typography.Title level={2} style={{ marginBottom: 6, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {title}
        </Typography.Title>
      {description ? (
        <Typography.Paragraph type="secondary" style={{ maxWidth: 720, marginBottom: 0, fontSize: 15 }}>
          {description}
        </Typography.Paragraph>
      ) : null}
      </div>
    </Space>
    {actions ? <Space wrap>{actions}</Space> : null}
  </Flex>
)
