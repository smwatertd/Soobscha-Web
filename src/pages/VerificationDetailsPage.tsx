import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { FileProtectOutlined, IdcardOutlined, InfoCircleOutlined, PhoneOutlined, ProfileOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Button, Col, Row, Space, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { verificationsApi } from '../api/endpoints'
import { ActionPanel } from '../components/ActionPanel'
import { ApplicantContactsPanel } from '../components/ApplicantContactsPanel'
import { DetailSection } from '../components/DetailSection'
import { FieldGrid, FieldList } from '../components/FieldGrid'
import { HumanDataCard } from '../components/HumanDataCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { UserProfileLink } from '../components/UserProfileLink'
import {
  UserVerificationAttempts,
  userVerificationAttemptsSectionIcon,
  UserVerificationAttemptsSectionTitle,
} from '../components/UserVerificationAttempts'
import { useBeneficiaryCategories } from '../hooks/useBeneficiaryCategories'
import { useCities } from '../hooks/useCities'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import { useVolunteerSkillCatalogData } from '../hooks/useVolunteerSkillCatalog'
import type { VerificationAttemptDetails } from '../types/api'
import { getApplicantCity } from '../utils/applicant'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { labelOrValue, ROLES } from '../utils/labels'

export const VerificationDetailsPage = () => {
  const { id } = useParams()
  const [attempt, setAttempt] = useState<VerificationAttemptDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const categoryLabels = useBeneficiaryCategories()
  const cityLabels = useCities()
  const skillCatalog = useVolunteerSkillCatalogData()

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
        setAttempt(await verificationsApi.get(id))
      } catch (verificationError) {
        setError(getErrorMessage(verificationError))
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
    return <StateBlock title="Загружаем верификацию..." />
  }

  if (error || !attempt || !id) {
    return <StateBlock title="Не удалось открыть верификацию" description={error} />
  }

  const fallbackActions =
    attempt.status === 'PENDING_MODERATION' ? ['approve', 'reject'] : attempt.status === 'APPROVED' ? ['revoke'] : []
  return (
    <>
      <PageHeader
        icon={<SafetyCertificateOutlined />}
        title={attempt.applicant_full_name || `Верификация ${truncateId(attempt.id)}`}
        description={`${labelOrValue(ROLES, attempt.user_role)} · пользователь ${truncateId(attempt.user_id)}`}
        actions={
          <Space wrap>
            <Link to={`/verifications?user_id=${attempt.user_id}`}>
              <Button>Все попытки пользователя</Button>
            </Link>
            <Link to="/verifications">
              <Button>К списку</Button>
            </Link>
          </Space>
        }
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Основная информация" />}>
              <FieldGrid
                fields={[
                  { label: 'Статус', value: <StatusBadge status={attempt.status} /> },
                  {
                    label: attempt.user_role === 'BENEFICIARY' ? 'Бенефициар' : 'Пользователь',
                    value: (
                      <UserProfileLink userId={attempt.user_id}>
                        {attempt.applicant_full_name || truncateId(attempt.user_id)}
                      </UserProfileLink>
                    ),
                  },
                  { label: 'Роль', value: labelOrValue(ROLES, attempt.user_role) },
                  { label: 'Категория', value: labelOrValue(categoryLabels, attempt.category) },
                  { label: 'Город', value: labelOrValue(cityLabels, getApplicantCity(attempt)) },
                  { label: 'Действительна до', value: formatDate(attempt.derived_valid_until) },
                  { label: 'Создана', value: formatDate(attempt.created_at) },
                  { label: 'Обновлена', value: formatDate(attempt.updated_at) },
                ]}
              />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<PhoneOutlined />} label="Контакты для связи" />}>
              <ApplicantContactsPanel contact={attempt.applicant_contact} />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<IdcardOutlined />} label="Общие данные" />}>
              <HumanDataCard
                value={attempt.common_data}
                emptyText="Общие данные не заполнены."
                hiddenKeys={['city']}
                valueLabels={{ city: cityLabels }}
              />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<FileProtectOutlined />} label="Данные категории" />}>
              <HumanDataCard
                value={attempt.category_data}
                emptyText="Данные категории не заполнены."
                valueLabels={{ skill_code: skillCatalog.labels }}
                skillCatalog={skillCatalog.byCode}
              />
            </DetailSection>
            {attempt.public_snapshot_json && Object.keys(attempt.public_snapshot_json).length ? (
              <DetailSection title={<SectionTitle icon={<ProfileOutlined />} label="Публичный снимок" />}>
                <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                  Данные, которые будут видны другим пользователям после одобрения верификации.
                </Typography.Paragraph>
                <HumanDataCard
                  value={attempt.public_snapshot_json}
                  emptyText="Публичный снимок пуст."
                  valueLabels={{ city: cityLabels, category: categoryLabels, base_category: categoryLabels }}
                  skillCatalog={skillCatalog.byCode}
                />
              </DetailSection>
            ) : null}
          </Space>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<ThunderboltOutlined />} label="Действия" />}>
              <ActionPanel
                subject={`верификации ${truncateId(attempt.id)}`}
                fallbackActions={fallbackActions}
                onApprove={async () => {
                  setAttempt(await verificationsApi.approve(id))
                  await load()
                }}
                onReasonAction={async (action, reason) => {
                  if (action === 'reject') {
                    setAttempt(await verificationsApi.reject(id, { reason }))
                  }

                  if (action === 'revoke') {
                    setAttempt(await verificationsApi.revoke(id, { reason }))
                  }

                  await load()
                }}
              />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Решения" />}>
              <FieldList
                fields={[
                  {
                    label: 'Одобрена',
                    value: (
                      <DecisionMeta
                        at={attempt.approved_at}
                        byUserId={attempt.approved_by_user_id}
                      />
                    ),
                  },
                  {
                    label: 'Отклонена',
                    value: (
                      <DecisionMeta
                        at={attempt.rejected_at}
                        byUserId={attempt.rejected_by_user_id}
                      />
                    ),
                  },
                  {
                    label: 'Отозвана',
                    value: (
                      <DecisionMeta
                        at={attempt.revoked_at}
                        byUserId={attempt.revoked_by_user_id}
                      />
                    ),
                  },
                  { label: 'Причина отклонения', value: attempt.rejection_reason ?? '—' },
                  { label: 'Причина отзыва', value: attempt.revocation_reason ?? '—' },
                ]}
              />
            </DetailSection>
            <DetailSection
              title={
                <UserVerificationAttemptsSectionTitle
                  icon={userVerificationAttemptsSectionIcon}
                  label="Другие попытки пользователя"
                />
              }
            >
              <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                История верификаций этого пользователя помогает понять прошлые отклонения, доработки и одобрения.
              </Typography.Paragraph>
              <UserVerificationAttempts
                userId={attempt.user_id}
                currentAttemptId={attempt.id}
                categoryLabels={categoryLabels}
              />
            </DetailSection>
          </Space>
        </Col>
      </Row>
    </>
  )
}

const DecisionMeta = ({ at, byUserId }: { at?: string | null; byUserId?: string | null }) => {
  if (!at && !byUserId) {
    return '—'
  }

  return (
    <Space direction="vertical" size={0}>
      {at ? <span>{formatDate(at)}</span> : null}
      {byUserId ? (
        <UserProfileLink userId={byUserId}>Модератор: {truncateId(byUserId)}</UserProfileLink>
      ) : null}
    </Space>
  )
}

const SectionTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={8}>
    <span className="section-title-icon">{icon}</span>
    {label}
  </Space>
)
