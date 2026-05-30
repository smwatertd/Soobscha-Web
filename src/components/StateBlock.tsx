import { Alert, Card, Empty, Spin } from 'antd'

type StateBlockProps = {
  title: string
  description?: string
}

export const StateBlock = ({ title, description }: StateBlockProps) => {
  if (title.toLowerCase().includes('загружаем')) {
    return (
      <Card style={{ margin: '20px 0' }}>
        <Spin tip={title}>
          <div style={{ minHeight: 80 }} />
        </Spin>
      </Card>
    )
  }

  if (title.toLowerCase().includes('ошибка') || title.toLowerCase().includes('не удалось')) {
    return <Alert type="error" showIcon message={title} description={description} style={{ margin: '20px 0' }} />
  }

  return <Empty description={description ?? title} style={{ margin: '20px 0' }} />
}
