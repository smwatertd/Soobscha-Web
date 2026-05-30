import { useCallback, useEffect, useState } from 'react'
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, InputNumber, Modal, Space, Switch, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { adminsApi } from '../../api/endpoints'
import { PageHeader } from '../../components/PageHeader'
import { StateBlock } from '../../components/StateBlock'
import { useRealtimeRefresh } from '../../hooks/useRealtimeRefresh'
import type { CreateSkillCatalogItemRequest, SkillCatalogAdminItem } from '../../types/api'
import { getErrorMessage } from '../../utils/format'

type CreateSkillFormValues = CreateSkillCatalogItemRequest & {
  requires_verified: boolean
  is_active: boolean
}

export const AdminSkillsCatalogPage = () => {
  const [includeInactive, setIncludeInactive] = useState(true)
  const [items, setItems] = useState<SkillCatalogAdminItem[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<CreateSkillFormValues>()

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        setItems(await adminsApi.skillCatalog(includeInactive))
      } catch (requestError: unknown) {
        setError(getErrorMessage(requestError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [includeInactive],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  const openCreateModal = () => {
    form.resetFields()
    form.setFieldsValue({
      requires_verified: false,
      is_active: true,
      sort_order: 0,
    })
    setIsModalOpen(true)
  }

  const submitCreate = async () => {
    const values = await form.validateFields()
    setIsSubmitting(true)

    try {
      await adminsApi.createSkillCatalogItem(values)
      setIsModalOpen(false)
      await load(true)
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        icon={<AppstoreOutlined />}
        title="Каталог навыков"
        description="Справочник навыков волонтёров: просмотр и добавление новых позиций."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Добавить навык
          </Button>
        }
      />
      <Space wrap style={{ marginBottom: 20 }}>
        <Space size={8}>
          <Switch checked={includeInactive} onChange={setIncludeInactive} />
          <Typography.Text type="secondary">Показывать неактивные</Typography.Text>
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем каталог..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error ? (
        <Table rowKey="code" dataSource={items} columns={columns} pagination={{ pageSize: 50 }} />
      ) : null}
      <Modal
        title="Новый навык"
        open={isModalOpen}
        okText="Создать"
        cancelText="Отмена"
        confirmLoading={isSubmitting}
        onOk={() => void submitCreate()}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Код" rules={[{ required: true, message: 'Укажите код' }]}>
            <Input placeholder="transport_help" />
          </Form.Item>
          <Form.Item name="label" label="Название" rules={[{ required: true, message: 'Укажите название' }]}>
            <Input placeholder="Помощь с транспортом" />
          </Form.Item>
          <Form.Item name="group" label="Группа (код)" rules={[{ required: true, message: 'Укажите группу' }]}>
            <Input placeholder="mobility" />
          </Form.Item>
          <Form.Item name="group_label" label="Группа (название)" rules={[{ required: true, message: 'Укажите название группы' }]}>
            <Input placeholder="Мобильность" />
          </Form.Item>
          <Form.Item name="sort_order" label="Порядок сортировки">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requires_verified" valuePropName="checked">
            <Checkbox>Требует верификации</Checkbox>
          </Form.Item>
          <Form.Item name="is_active" valuePropName="checked">
            <Checkbox>Активен</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const columns: TableColumnsType<SkillCatalogAdminItem> = [
  {
    title: 'Код',
    dataIndex: 'code',
  },
  {
    title: 'Название',
    dataIndex: 'label',
  },
  {
    title: 'Группа',
    render: (_, item) => (
      <Space direction="vertical" size={0}>
        <Typography.Text>{item.group_label}</Typography.Text>
        <Typography.Text type="secondary">{item.group}</Typography.Text>
      </Space>
    ),
  },
  {
    title: 'Верификация',
    dataIndex: 'requires_verified',
    render: (value: boolean) => (value ? <Tag color="blue">Нужна</Tag> : <Tag>Не нужна</Tag>),
  },
  {
    title: 'Статус',
    dataIndex: 'is_active',
    render: (value: boolean) => (value ? <Tag color="green">Активен</Tag> : <Tag color="red">Неактивен</Tag>),
  },
  {
    title: 'Порядок',
    dataIndex: 'sort_order',
  },
]
