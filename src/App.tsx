import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RequireRole } from './components/RequireRole'
import { AdminAppLayout } from './layout/AdminAppLayout'

const AppLayout = lazy(() => import('./layout/AppLayout').then((module) => ({ default: module.AppLayout })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RequestDetailsPage = lazy(() =>
  import('./pages/RequestDetailsPage').then((module) => ({ default: module.RequestDetailsPage })),
)
const RequestsListPage = lazy(() =>
  import('./pages/RequestsListPage').then((module) => ({ default: module.RequestsListPage })),
)
const ReportDetailsPage = lazy(() =>
  import('./pages/ReportDetailsPage').then((module) => ({ default: module.ReportDetailsPage })),
)
const ReportsListPage = lazy(() => import('./pages/ReportsListPage').then((module) => ({ default: module.ReportsListPage })))
const VerificationDetailsPage = lazy(() =>
  import('./pages/VerificationDetailsPage').then((module) => ({ default: module.VerificationDetailsPage })),
)
const VerificationsListPage = lazy(() =>
  import('./pages/VerificationsListPage').then((module) => ({ default: module.VerificationsListPage })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })),
)
const AdminUsersListPage = lazy(() =>
  import('./pages/admin/AdminUsersListPage').then((module) => ({ default: module.AdminUsersListPage })),
)
const AdminUserDetailsPage = lazy(() =>
  import('./pages/admin/AdminUserDetailsPage').then((module) => ({ default: module.AdminUserDetailsPage })),
)
const AdminStaffPage = lazy(() =>
  import('./pages/admin/AdminStaffPage').then((module) => ({ default: module.AdminStaffPage })),
)
const AdminModerationAuditPage = lazy(() =>
  import('./pages/admin/AdminModerationAuditPage').then((module) => ({ default: module.AdminModerationAuditPage })),
)
const AdminSkillsCatalogPage = lazy(() =>
  import('./pages/admin/AdminSkillsCatalogPage').then((module) => ({ default: module.AdminSkillsCatalogPage })),
)
const AdminComplaintsListPage = lazy(() =>
  import('./pages/admin/AdminComplaintsListPage').then((module) => ({ default: module.AdminComplaintsListPage })),
)
const ComplaintsListPage = lazy(() =>
  import('./pages/ComplaintsListPage').then((module) => ({ default: module.ComplaintsListPage })),
)

const PageLoader = () => <Spin fullscreen tip="Загрузка страницы..." />

const HomeRedirect = () => {
  const { userRole } = useAuth()

  if (userRole === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <DashboardPage />
}

export const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RequireRole role="ADMIN" />}>
          <Route element={<AdminAppLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersListPage />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
            <Route path="/admin/staff" element={<AdminStaffPage />} />
            <Route path="/admin/moderation-audit" element={<AdminModerationAuditPage />} />
            <Route path="/admin/skills" element={<AdminSkillsCatalogPage />} />
            <Route path="/admin/complaints" element={<AdminComplaintsListPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="PARTNER" />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeRedirect />} />
            <Route path="requests" element={<RequestsListPage />} />
            <Route path="requests/:id" element={<RequestDetailsPage />} />
            <Route path="reports" element={<ReportsListPage />} />
            <Route path="reports/:id" element={<ReportDetailsPage />} />
            <Route path="verifications" element={<VerificationsListPage />} />
            <Route path="verifications/:id" element={<VerificationDetailsPage />} />
            <Route path="complaints" element={<ComplaintsListPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
)
