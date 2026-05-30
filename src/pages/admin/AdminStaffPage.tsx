import { useCallback, useEffect, useState } from 'react'
import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { adminsApi } from '../../api/endpoints'
import { PageHeader } from '../../components/PageHeader'
import { StateBlock } from '../../components/StateBlock'
import { useRealtimeRefresh } from '../../hooks/useRealtimeRefresh'
import type { StaffMember } from '../../types/api'
import { getErrorMessage } from '../../utils/format'
import { ROLES } from '../../utils/labels'

export const AdminStaffPage = () => {
  const [role, setRole] = useState<'PARTNER' | 'ADMIN'>('PARTNER')
  const [items, setItems] = useState<StaffMember[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        setItems(await adminsApi.listStaff(role))
      } catch (requestError: unknown) {
        setError(getErrorMessage(requestError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [role],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  const deactivate = async (userId: string) => {
    await adminsApi.deactivateStaff(userId, role)
    await load(true)
  }

  return (
    <>
      <PageHeader
        icon={<SafetyCertificateOutlined />}
        title="Сотрудники"
        description="Управление учётными записями партнёров и администраторов платформы."
      />
      <Space wrap style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Роль</Typography.Text>
          <Select
            style={{ width: 220 }}
            value={role}
            onChange={setRole}
            options={[
              { value: 'PARTNER', label: ROLES.PARTNER },
              { value: 'ADMIN', label: ROLES.ADMIN },
            ]}
          />
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем сотрудников..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error ? (
        <Table rowKey="user_id" dataSource={items} columns={getColumns(role, deactivate)} pagination={false} />
      ) : null}
    </>
  )
}

const getColumns = (
  role: string,
  onDeactivate: (userId: string) => Promise<void>,
): TableColumnsType<StaffMember> => [
  {
    title: 'Сотрудник',
    render: (_, member) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>
          {[member.last_name, member.first_name, member.middle_name].filter(Boolean).join(' ')}
        </Typography.Text>
        <Typography.Text type="secondary">{member.email ?? '—'}</Typography.Text>
      </Space>
    ),
  },
  {
    title: 'Роль',
    dataIndex: 'role',
    render: (value: string) => ROLES[value] ?? value,
  },
  {
    title: 'Статус',
    dataIndex: 'is_active',
    render: (value: boolean) => (value ? <Tag color="green">Активен</Tag> : <Tag color="red">Деактивирован</Tag>),
  },
  {
    title: 'Действие',
    render: (_, member) =>
      member.is_active ? (
        <Popconfirm
          title="Деактивировать сотрудника?"
          okText="Деактивировать"
          cancelText="Отмена"
          onConfirm={() => void onDeactivate(member.user_id)}
        >
          <Button danger size="small" icon={<UserOutlined />}>
            Деактивировать
          </Button>
        </Popconfirm>
      ) : (
        <Typography.Text type="secondary">—</Typography.Text>
      ),
  },
]
