import { useState } from 'react'
import { Alert, Button, Form, Input, Modal, Space, Typography } from 'antd'
import type { Complaint } from '../types/api'

type ComplaintReviewModalProps = {
  complaint: Complaint
  onClose: () => void
  onSubmit: (uphold: boolean, reviewNote: string) => Promise<void>
}

export const ComplaintReviewModal = ({ complaint, onClose, onSubmit }: ComplaintReviewModalProps) => {
  const [form] = Form.useForm<{ review_note: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (uphold: boolean) => {
    setIsSubmitting(true)
    setError('')

    try {
      const values = await form.validateFields()
      await onSubmit(uphold, values.review_note?.trim() ?? '')
      onClose()
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Рассмотрение жалобы" open onCancel={onClose} footer={null} width={560}>
      <Typography.Paragraph type="secondary">{complaint.reason}</Typography.Paragraph>
      {complaint.details ? (
        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{complaint.details}</Typography.Paragraph>
      ) : null}
      <Form form={form} layout="vertical">
        <Form.Item
          label="Комментарий партнёра"
          name="review_note"
          rules={[{ max: 4000, message: 'Не более 4000 символов' }]}
        >
          <Input.TextArea rows={4} placeholder="Необязательно: пояснение к решению" />
        </Form.Item>
      </Form>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button danger loading={isSubmitting} onClick={() => void handleSubmit(false)}>
          Отклонить жалобу
        </Button>
        <Button type="primary" loading={isSubmitting} onClick={() => void handleSubmit(true)}>
          Подтвердить жалобу
        </Button>
      </Space>
    </Modal>
  )
}
