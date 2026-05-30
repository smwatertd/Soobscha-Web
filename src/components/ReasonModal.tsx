import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { Alert, Button, Form, Input, Modal, Select, Space, Typography } from 'antd'
import type { CodeLabel } from '../types/api'
import {
  deleteCustomTemplate,
  listBuiltInTemplates,
  listCustomTemplates,
  saveCustomTemplate,
  type ReasonTemplate,
} from '../utils/reasonTemplates'

type ReasonModalProps = {
  title: string
  submitLabel: string
  action: string
  code?: string
  codeOptions?: CodeLabel[]
  onSubmit: (reason: string, code?: string) => Promise<void>
  onClose: () => void
}

export const ReasonModal = ({ title, submitLabel, action, code, codeOptions = [], onSubmit, onClose }: ReasonModalProps) => {
  const [form] = Form.useForm<{ reason: string; code?: string }>()
  const [selectedCode, setSelectedCode] = useState(codeOptions[0]?.code ?? code)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<ReasonTemplate[]>(() => listCustomTemplates(action))
  const [templateLabel, setTemplateLabel] = useState('')
  const [error, setError] = useState('')

  const templates = useMemo(
    () => [...listBuiltInTemplates(action), ...customTemplates],
    [action, customTemplates],
  )

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(values.reason.trim(), values.code ?? selectedCode)
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось выполнить действие')
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyTemplate = (templateId?: string) => {
    const template = templates.find((item) => item.id === templateId)

    if (!template) {
      return
    }

    form.setFieldValue('reason', template.text)
  }

  const handleSaveTemplate = async () => {
    const reason = String(form.getFieldValue('reason') ?? '').trim()

    if (reason.length < 3) {
      setError('Чтобы сохранить шаблон, заполните причину минимум из 3 символов.')
      return
    }

    const label = templateLabel.trim() || `Мой шаблон ${customTemplates.length + 1}`
    const created = saveCustomTemplate(action, label, reason)
    setCustomTemplates((prev) => [created, ...prev])
    setTemplateLabel('')
    setError('')
  }

  const handleDeleteTemplate = (templateId: string) => {
    deleteCustomTemplate(templateId)
    setCustomTemplates((prev) => prev.filter((item) => item.id !== templateId))
  }

  return (
    <Modal
      title={title}
      open
      okText={submitLabel}
      cancelText="Отмена"
      confirmLoading={isSubmitting}
      onOk={() => void handleSubmit()}
      onCancel={onClose}
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical" initialValues={{ code: selectedCode }}>
        {templates.length ? (
          <Form.Item label="Шаблон причины">
            <Select
              placeholder="Выберите шаблон"
              options={templates.map((template) => ({
                value: template.id,
                label: template.builtIn ? `${template.label} · пресет` : `${template.label} · мой`,
              }))}
              onChange={applyTemplate}
              allowClear
            />
          </Form.Item>
        ) : null}
        {codeOptions.length ? (
          <Form.Item label="Тип причины" name="code">
            <Select
              options={codeOptions.map((option) => ({ value: option.code, label: option.label }))}
              onChange={setSelectedCode}
            />
          </Form.Item>
        ) : null}
        <Form.Item
          label="Причина"
          name="reason"
          rules={[{ required: true, min: 3, message: 'Укажите причину минимум из 3 символов' }]}
        >
          <Input.TextArea rows={5} autoFocus />
        </Form.Item>
        <Form.Item label="Сохранить как пользовательский шаблон">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={templateLabel}
              onChange={(event) => setTemplateLabel(event.target.value)}
              placeholder="Название шаблона (опционально)"
              maxLength={90}
            />
            <Button icon={<PlusOutlined />} onClick={() => void handleSaveTemplate()}>
              Сохранить
            </Button>
          </Space.Compact>
        </Form.Item>
        {customTemplates.length ? (
          <Form.Item label="Мои шаблоны">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {customTemplates.map((template) => (
                <div className="reason-template-row" key={template.id}>
                  <div>
                    <Typography.Text strong>{template.label}</Typography.Text>
                    <Typography.Paragraph
                      type="secondary"
                      style={{ marginBottom: 0, marginTop: 2 }}
                      ellipsis={{ rows: 2, expandable: false }}
                    >
                      {template.text}
                    </Typography.Paragraph>
                  </div>
                  <Space>
                    <Button size="small" onClick={() => applyTemplate(template.id)}>
                      Применить
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Удалить
                    </Button>
                  </Space>
                </div>
              ))}
            </Space>
          </Form.Item>
        ) : null}
        {error ? <Alert type="error" message={error} showIcon /> : null}
      </Form>
    </Modal>
  )
}
