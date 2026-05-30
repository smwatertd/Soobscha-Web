import { CheckCircleOutlined, DollarCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'
import type { JsonObject } from '../types/api'
import { formatDate, formatMoney } from '../utils/format'
import { humanizeValue } from '../utils/humanize'
import { HumanDataCard } from './HumanDataCard'

type FinancialSummaryProps = {
  financials?: JsonObject | null
  donations?: JsonObject | null
  amountRequestedKopeks?: number
  amountCollectedKopeks?: number
}

export const FinancialSummary = ({
  financials,
  donations,
  amountRequestedKopeks,
  amountCollectedKopeks,
}: FinancialSummaryProps) => {
  const requestedKopeks = getNumber(financials?.requested_kopeks) ?? amountRequestedKopeks
  const collectedKopeks = getNumber(financials?.collected_kopeks) ?? amountCollectedKopeks
  const remainingKopeks = getNumber(financials?.remaining_to_collect_kopeks)
  const refundObligation = getObject(financials?.refund_obligation)
  const financialFields = omitKeys(financials, ['requested_kopeks', 'collected_kopeks', 'refund_obligation'])

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small" className="finance-stat-card finance-stat-card--primary">
            <Statistic title="Запрошено" value={formatMoney(requestedKopeks)} prefix={<DollarCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" className="finance-stat-card finance-stat-card--success">
            <Statistic title="Собрано" value={formatMoney(collectedKopeks)} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {typeof requestedKopeks === 'number' && typeof collectedKopeks === 'number' ? (
        <Card size="small" className="finance-progress-card">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
              <Typography.Text strong>Прогресс сбора</Typography.Text>
              <Typography.Text type="secondary">Осталось {formatMoney(remainingKopeks)}</Typography.Text>
            </Space>
            <Progress percent={getCollectionPercent(requestedKopeks, collectedKopeks)} />
          </Space>
        </Card>
      ) : null}

      {Object.keys(financialFields).length ? (
        <div>
          <Typography.Title level={5}>Финансовое состояние</Typography.Title>
          <HumanDataCard value={financialFields} />
        </div>
      ) : null}

      {refundObligation ? <RefundObligationCard value={refundObligation} /> : null}

      {donations && Object.keys(donations).length ? (
        <div>
          <Typography.Title level={5}>Пожертвования</Typography.Title>
          <HumanDataCard value={donations} />
        </div>
      ) : null}
    </Space>
  )
}

const RefundObligationCard = ({ value }: { value: JsonObject }) => (
  <Card
    className="refund-obligation-card"
    title={
      <Space size={8}>
        <span className="refund-obligation-card__icon">
          <ReloadOutlined />
        </span>
        Обязательство по возврату
      </Space>
    }
  >
    <div className="refund-obligation-grid">
      <div className="refund-obligation-status">
        <Typography.Text className="history-field__label">Состояние обязательства</Typography.Text>
        <Space size={8} wrap>
          <Tag color={value.status === 'COMPLETED' ? 'success' : 'warning'}>{humanizeValue('status', value.status)}</Tag>
          {typeof value.completed_at === 'string' ? (
            <Typography.Text type="secondary">завершено {formatDate(value.completed_at)}</Typography.Text>
          ) : null}
        </Space>
      </div>
      <div className="history-field">
        <Typography.Text className="history-field__label">Необходимо вернуть</Typography.Text>
        <div className="history-field__value">{formatMoney(getNumber(value.required_kopeks))}</div>
      </div>
      <div className="history-field">
        <Typography.Text className="history-field__label">Возвращено</Typography.Text>
        <div className="history-field__value">{formatMoney(getNumber(value.returned_kopeks))}</div>
      </div>
      <div className="history-field">
        <Typography.Text className="history-field__label">Осталось вернуть</Typography.Text>
        <div className="history-field__value">{formatMoney(getNumber(value.remaining_kopeks))}</div>
      </div>
    </div>
  </Card>
)

const getCollectionPercent = (requestedKopeks: number, collectedKopeks: number) =>
  requestedKopeks > 0 ? Math.min(100, Math.round((collectedKopeks / requestedKopeks) * 100)) : 0

const getNumber = (value: unknown) => (typeof value === 'number' ? value : undefined)

const getObject = (value: unknown): JsonObject | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as JsonObject) : undefined

const omitKeys = (value: JsonObject | null | undefined, keys: string[]) =>
  value ? Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key))) : {}
