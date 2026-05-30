import { useState } from 'react'
import { AuditOutlined } from '@ant-design/icons'
import { Alert, Button, Form, InputNumber, Space, Typography } from 'antd'
import type { ReportDetails } from '../types/api'
import { formatMoney } from '../utils/format'
import { normalizeAction } from '../utils/labels'

type MaterialSettlementReviewPanelProps = {
  report: ReportDetails
  onSubmit: (spentConfirmedKopeks: number) => Promise<void>
}

export const canReviewMaterialReport = (report: ReportDetails) => {
  const hasAction = report.available_actions?.some(
    (action) => normalizeAction(String(action)) === 'review_material',
  )

  if (hasAction) {
    return true
  }

  return (
    report.help_request_type === 'MATERIAL' &&
    report.status === 'APPROVED' &&
    report.settlement_status === 'AWAITING_REFUND'
  )
}

export const MaterialSettlementReviewPanel = ({ report, onSubmit }: MaterialSettlementReviewPanelProps) => {
  const [form] = Form.useForm<{ spent_rubles: number }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const values = await form.validateFields()
      await onSubmit(Math.round(values.spent_rubles * 100))
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        Укажите сумму подтверждённых расходов по материальному отчёту. Текущее значение:{' '}
        {formatMoney(report.spent_confirmed_kopeks)}.
      </Typography.Text>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          spent_rubles:
            typeof report.spent_confirmed_kopeks === 'number' ? report.spent_confirmed_kopeks / 100 : undefined,
        }}
      >
        <Form.Item
          name="spent_rubles"
          label="Подтверждённые расходы, ₽"
          rules={[
            { required: true, message: 'Укажите сумму расходов' },
            { type: 'number', min: 0, message: 'Сумма не может быть отрицательной' },
          ]}
        >
          <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} addonAfter="₽" />
        </Form.Item>
      </Form>
      {error ? <Alert type="error" message={error} showIcon /> : null}
      <Button type="primary" icon={<AuditOutlined />} loading={isSubmitting} onClick={() => void submit()}>
        Подтвердить расходы
      </Button>
    </Space>
  )
}
