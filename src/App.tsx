import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RequestDetailsPage } from './pages/RequestDetailsPage'
import { RequestsListPage } from './pages/RequestsListPage'
import { ReportDetailsPage } from './pages/ReportDetailsPage'
import { ReportsListPage } from './pages/ReportsListPage'
import { VerificationDetailsPage } from './pages/VerificationDetailsPage'
import { VerificationsListPage } from './pages/VerificationsListPage'

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="requests" element={<RequestsListPage />} />
        <Route path="requests/:id" element={<RequestDetailsPage />} />
        <Route path="reports" element={<ReportsListPage />} />
        <Route path="reports/:id" element={<ReportDetailsPage />} />
        <Route path="verifications" element={<VerificationsListPage />} />
        <Route path="verifications/:id" element={<VerificationDetailsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
