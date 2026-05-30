import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { FileTextOutlined, HistoryOutlined, InfoCircleOutlined, PictureOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Button, Col, Row, Space } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { AppNavLink } from '../components/AppNavLink'
import { reportsApi } from '../api/endpoints'
import { ActionPanel } from '../components/ActionPanel'
import { DetailSection } from '../components/DetailSection'
import { ReportDecisionReasons } from '../components/DecisionReasonsPanel'
import { FieldGrid } from '../components/FieldGrid'
import { HistoryList } from '../components/HistoryList'
import {
  canReviewMaterialReport,
  MaterialSettlementReviewPanel,
} from '../components/MaterialSettlementReviewPanel'
import {
  formatReportPayloadValue,
  getReportPayloadEntries,
  getReportPayloadFieldLabel,
  isMaterialHelpRequestReport,
} from '../utils/reportDisplay'
import { MediaGrid } from '../components/MediaGrid'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import type { ReportDetails, ReportVersion } from '../types/api'
import { formatDate, formatMoney, getErrorMessage, truncateId } from '../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue } from '../utils/labels'

export const ReportDetailsPage = () => {
  const { id } = useParams()
  const [report, setReport] = useState<ReportDetails | null>(null)
  const [history, setHistory] = useState<ReportVersion[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(
    async (silent = false) => {
      if (!id) {
        return
      }

      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const [reportResponse, historyResponse] = await Promise.all([
          reportsApi.get(id),
          reportsApi.history(id).catch(() => []),
        ])
        setReport(reportResponse)
        setHistory(historyResponse)
      } catch (reportError) {
        setError(getErrorMessage(reportError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [id],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  if (isLoading) {
    return <StateBlock title="Загружаем отчёт..." />
  }

  if (error || !report || !id) {
    return <StateBlock title="Не удалось открыть отчёт" description={error} />
  }

  const fallbackActions = report.status === 'PENDING_MODERATION' ? ['approve', 'reject', 'return_to_rework'] : []
  const showMaterialSettlementReview = canReviewMaterialReport(report)
  return (
    <>
      <PageHeader
        icon={<FileTextOutlined />}
        title={`Отчёт ${truncateId(report.id)}`}
        description={
          <>
            {labelOrValue(HELP_REQUEST_TYPES, report.help_request_type)} заявка{' '}
            <AppNavLink to={`/requests/${report.help_request_id}`}>{truncateId(report.help_request_id)}</AppNavLink>
          </>
        }
        actions={
          <Link to="/reports">
            <Button>К списку</Button>
          </Link>
        }
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Основная информация" />}>
              <FieldGrid
                fields={[
                  { label: 'Статус', value: <StatusBadge status={report.status} /> },
                  { label: 'Тип заявки', value: labelOrValue(HELP_REQUEST_TYPES, report.help_request_type) },
                  {
                    label: 'Заявка',
                    value: (
                      <AppNavLink to={`/requests/${report.help_request_id}`}>{truncateId(report.help_request_id)}</AppNavLink>
                    ),
                  },
                  ...(isMaterialHelpRequestReport(report)
                    ? [
                        {
                          label: 'Статус расчётов',
                          value: report.settlement_status ? (
                            <StatusBadge status={report.settlement_status} />
                          ) : (
                            '—'
                          ),
                        },
                      ]
                    : []),
                  { label: 'Подтверждено расходов', value: formatMoney(report.spent_confirmed_kopeks) },
                  ...(report.settlement_reviewed_at
                    ? [{ label: 'Расчёты проверены', value: formatDate(report.settlement_reviewed_at) }]
                    : []),
                  { label: 'Создан', value: formatDate(report.created_at) },
                  { label: 'Обновлён', value: formatDate(report.updated_at) },
                ]}
              />
            </DetailSection>
            {getReportPayloadEntries(report.payload).length ? (
              <DetailSection title={<SectionTitle icon={<FileTextOutlined />} label="Данные отчёта" />}>
                <FieldGrid
                  column={1}
                  fields={getReportPayloadEntries(report.payload).map(([key, value]) => ({
                    label: getReportPayloadFieldLabel(key),
                    value: formatReportPayloadValue(key, value),
                  }))}
                />
              </DetailSection>
            ) : null}
            <DetailSection title={<SectionTitle icon={<PictureOutlined />} label="Медиа" />}>
              <MediaGrid files={report.media_files} />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<HistoryOutlined />} label="История" />}>
              <HistoryList items={history} />
            </DetailSection>
          </Space>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<ThunderboltOutlined />} label="Действия" />}>
              <ActionPanel
                actions={report.available_actions}
                subject={`отчёта ${truncateId(report.id)}`}
                fallbackActions={fallbackActions}
                onApprove={async () => {
                  setReport(await reportsApi.approve(id))
                  await load()
                }}
                onReasonAction={async (action, reason) => {
                  if (action === 'reject') {
                    setReport(await reportsApi.reject(id, { reason }))
                  }

                  if (action === 'return_to_rework' || action === 'return-to-rework') {
                    setReport(await reportsApi.returnToRework(id, { reason }))
                  }

                  await load()
                }}
              />
            </DetailSection>
            {showMaterialSettlementReview ? (
              <DetailSection title={<SectionTitle icon={<ThunderboltOutlined />} label="Финансовая проверка" />}>
                <MaterialSettlementReviewPanel
                  report={report}
                  onSubmit={async (spentConfirmedKopeks) => {
                    setReport(await reportsApi.reviewMaterial(id, { spent_confirmed_kopeks: spentConfirmedKopeks }))
                    await load()
                  }}
                />
              </DetailSection>
            ) : null}
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Причины решений" />}>
              <ReportDecisionReasons source={report} />
            </DetailSection>
          </Space>
        </Col>
      </Row>
    </>
  )
}

const SectionTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={8}>
    <span className="section-title-icon">{icon}</span>
    {label}
  </Space>
)
