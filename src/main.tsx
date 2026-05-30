import { StrictMode } from 'react'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AuthProvider } from './auth/AuthContext'
import { NotificationsProvider } from './notifications/NotificationsContext'
import { DataRefreshProvider } from './realtime/DataRefreshContext'
import 'antd/dist/reset.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#2f68d8',
          colorText: '#172033',
          colorTextSecondary: '#66758f',
          colorBgLayout: '#edf2f8',
          colorBorderSecondary: '#d9e3f2',
          borderRadius: 16,
          fontSize: 14,
          fontSizeHeading2: 34,
          fontSizeHeading3: 26,
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxShadowSecondary: '0 14px 34px rgb(23 32 51 / 9%)',
        },
        components: {
          Card: {
            headerFontSize: 17,
            headerFontSizeSM: 15,
          },
          Statistic: {
            titleFontSize: 14,
            contentFontSize: 32,
          },
          Table: {
            headerBg: '#f4f7fb',
            headerColor: '#394862',
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <DataRefreshProvider>
            <NotificationsProvider>
              <App />
            </NotificationsProvider>
          </DataRefreshProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
