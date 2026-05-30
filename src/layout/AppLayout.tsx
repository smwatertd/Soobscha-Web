import { Badge, Button, Drawer, Layout, Menu, Space, Spin, Tag, Typography } from 'antd'
import {
  BellOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useNotifications } from '../notifications/NotificationsContext'
import { formatDate } from '../utils/format'
import { getNotificationEntityPath } from '../utils/notificationNavigation'

const navItems = [
  { key: '/', label: 'Обзор', icon: <ThunderboltOutlined /> },
  { key: '/requests', label: 'Заявки', icon: <CheckSquareOutlined /> },
  { key: '/reports', label: 'Отчёты', icon: <FileTextOutlined /> },
  { key: '/verifications', label: 'Верификации', icon: <SafetyCertificateOutlined /> },
  { key: '/complaints', label: 'Жалобы', icon: <ExclamationCircleOutlined /> },
]

export const AppLayout = () => {
  const { logout } = useAuth()
  const { notifications, unreadCount, isLoading, hasMore, loadMore, markAsRead, markAllAsRead } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const selectedKey = navItems.find((item) => item.key !== '/' && location.pathname.startsWith(item.key))?.key ?? '/'

  const openNotification = (notificationId: string, path: string | null) => {
    void markAsRead(notificationId)

    if (path) {
      setDrawerOpen(false)
      navigate(path)
    }
  }

  return (
    <Layout className="app-shell">
      <Layout.Sider width={280} className="sidebar">
        <div className="sidebar__brand">
          <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Typography.Text>Сообща</Typography.Text>
              <Typography.Title level={4}>Кабинет партнёра</Typography.Title>
            </div>
            <Badge
              count={unreadCount}
              size="small"
              overflowCount={99}
              offset={[-2, 2]}
              className={unreadCount > 0 ? 'sidebar__notify-badge sidebar__notify-badge--active' : 'sidebar__notify-badge'}
            >
              <Button
                className={
                  unreadCount > 0 ? 'sidebar__notify-btn sidebar__notify-btn--unread' : 'sidebar__notify-btn'
                }
                icon={<BellOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label={
                  unreadCount > 0 ? `Открыть уведомления, непрочитанных: ${unreadCount}` : 'Открыть центр уведомлений'
                }
              />
            </Badge>
          </Space>
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
      <Drawer
        title="Уведомления"
        open={drawerOpen}
        width={420}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button size="small" onClick={() => void markAllAsRead()}>
            Прочитать все
          </Button>
        }
      >
        {isLoading && !notifications.length ? (
          <Spin />
        ) : notifications.length ? (
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            {notifications.map((item) => {
              const entityPath = getNotificationEntityPath(item)

              return (
                <button
                  className={
                    item.is_read
                      ? 'notification-item notification-item--read'
                      : 'notification-item notification-item--unread'
                  }
                  key={item.id}
                  type="button"
                  onClick={() => openNotification(item.id, entityPath)}
                >
                  <span className="notification-item__header">
                    <span className="notification-item__title-row">
                      {!item.is_read ? <span className="notification-item__dot" aria-hidden /> : null}
                      <Typography.Text strong className="notification-item__title">
                        {item.title}
                      </Typography.Text>
                    </span>
                    {!item.is_read ? (
                      <Tag color="blue" className="notification-item__tag">
                        Новое
                      </Tag>
                    ) : null}
                  </span>
                  <Typography.Paragraph className="notification-item__body">{item.body}</Typography.Paragraph>
                  <Typography.Text type="secondary" className="notification-item__date">
                    {formatDate(item.created_at)}
                  </Typography.Text>
                </button>
              )
            })}
            {hasMore ? (
              <Button block loading={isLoading} onClick={() => void loadMore()}>
                Загрузить ещё
              </Button>
            ) : null}
          </Space>
        ) : (
          <Typography.Text type="secondary">Пока уведомлений нет.</Typography.Text>
        )}
      </Drawer>
    </Layout>
  )
}
