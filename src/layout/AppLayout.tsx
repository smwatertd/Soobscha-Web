import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navItems = [
  { to: '/', label: 'Обзор' },
  { to: '/requests', label: 'Заявки' },
  { to: '/reports', label: 'Отчёты' },
  { to: '/verifications', label: 'Верификации' },
]

export const AppLayout = () => {
  const { logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span>Платформа помощи</span>
          <strong>Кабинет партнёра</strong>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="button secondary full-width" onClick={() => void logout()}>
          Выйти
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
