import { Button, Layout, Menu, Typography } from 'antd'
import {
  AppstoreOutlined,
  AuditOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const basePath = '/admin'

const navItems = [
  { key: basePath, label: 'Сводка', icon: <DashboardOutlined /> },
  { key: `${basePath}/users`, label: 'Пользователи', icon: <TeamOutlined /> },
  { key: `${basePath}/staff`, label: 'Сотрудники', icon: <SafetyCertificateOutlined /> },
  { key: `${basePath}/moderation-audit`, label: 'Аудит модерации', icon: <AuditOutlined /> },
  { key: `${basePath}/skills`, label: 'Каталог навыков', icon: <AppstoreOutlined /> },
  { key: `${basePath}/complaints`, label: 'Жалобы', icon: <ExclamationCircleOutlined /> },
]

export const AdminAppLayout = () => {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedKey =
    navItems.find((item) => item.key !== basePath && location.pathname.startsWith(item.key))?.key ?? basePath

  return (
    <Layout className="app-shell">
      <Layout.Sider width={280} className="sidebar sidebar--admin">
        <div className="sidebar__brand">
          <Typography.Text>Сообща</Typography.Text>
          <Typography.Title level={4}>Администрирование</Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
        />
        <Button icon={<LogoutOutlined />} block onClick={() => void logout()}>
          Выйти
        </Button>
      </Layout.Sider>
      <Layout.Content className="main-content">
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}

export const AdminPageIcon = () => (
  <span className="admin-page-icon">
    <UserOutlined />
  </span>
)
