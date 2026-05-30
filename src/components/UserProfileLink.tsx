import { useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Avatar, Button, Descriptions, Drawer, Image, Space, Spin, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { usersApi } from '../api/endpoints'
import type { UserPublicProfile } from '../types/api'
import { getErrorMessage, truncateId } from '../utils/format'
import { labelOrValue, ROLES } from '../utils/labels'
import { useBeneficiaryCategories } from '../hooks/useBeneficiaryCategories'
import { useCities } from '../hooks/useCities'
import { useVolunteerSkillCatalog } from '../hooks/useVolunteerSkillCatalog'
import { HumanDataCard } from './HumanDataCard'
import { PhoneLink } from './PhoneLink'

type UserProfileLinkProps = {
  userId?: string | null
  children?: ReactNode
}

const PRIMARY_PROFILE_FIELDS = new Set([
  'id',
  'user_id',
  'full_name',
  'name',
  'role',
  'user_role',
  'city',
  'avatar_url',
  'avatar',
  'email',
  'phone_number',
])

export const UserProfileLink = ({ userId, children }: UserProfileLinkProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserPublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const open = async () => {
    if (!userId) {
      return
    }

    setIsOpen(true)

    if (profile) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      setProfile(await usersApi.getPublicProfile(userId))
    } catch (profileError) {
      setError(getErrorMessage(profileError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button type="link" size="small" onClick={() => void open()} disabled={!userId} className="user-profile-link">
        {children ?? truncateId(userId)}
      </Button>
      <Drawer
        title="Профиль пользователя"
        width={460}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        destroyOnHidden
      >
        {isLoading ? <Spin tip="Загружаем профиль..." /> : null}
        {error ? <Alert type="error" showIcon message="Не удалось загрузить профиль" description={error} /> : null}
        {!isLoading && !error && profile ? <UserProfileContent profile={profile} fallbackUserId={userId} /> : null}
      </Drawer>
    </>
  )
}

const UserProfileContent = ({
  profile,
  fallbackUserId,
}: {
  profile: UserPublicProfile
  fallbackUserId?: string | null
}) => {
  const fullName = profile.full_name ?? profile.name ?? 'Пользователь'
  const role = profile.role ?? profile.user_role
  const avatarSrc = getAvatarSource(profile)
  const beneficiaryCategoryLabels = useBeneficiaryCategories()
  const cityLabels = useCities()
  const skillLabels = useVolunteerSkillCatalog()
  const restProfile = getRestProfile(profile)
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false)

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Space align="center" size={14}>
        <button
          type="button"
          className="user-profile-avatar"
          onClick={() => avatarSrc && setIsAvatarPreviewOpen(true)}
          disabled={!avatarSrc}
          aria-label="Открыть фотографию пользователя"
        >
          <Avatar size={56} icon={<UserOutlined />} src={avatarSrc} />
        </button>
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={fullName}
            style={{ display: 'none' }}
            preview={{
              visible: isAvatarPreviewOpen,
              onVisibleChange: setIsAvatarPreviewOpen,
            }}
          />
        ) : null}
        <Space direction="vertical" size={2}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {fullName}
          </Typography.Title>
          <Typography.Text type="secondary">{truncateId(profile.user_id ?? profile.id ?? fallbackUserId)}</Typography.Text>
        </Space>
      </Space>
      <Descriptions
        bordered
        size="small"
        column={1}
        items={[
          { key: 'role', label: 'Роль', children: labelOrValue(ROLES, role) },
          { key: 'city', label: 'Город', children: labelOrValue(cityLabels, profile.city) },
          { key: 'email', label: 'Email', children: profile.email ?? '—' },
          { key: 'phone', label: 'Телефон', children: <PhoneLink phone={profile.phone_number} /> },
        ]}
      />
      <HumanDataCard
        value={restProfile}
        emptyText="Дополнительных публичных данных нет."
        valueLabels={{
          base_category: beneficiaryCategoryLabels,
          category: beneficiaryCategoryLabels,
          city: cityLabels,
          skills: skillLabels,
          skill_codes: skillLabels,
        }}
      />
    </Space>
  )
}

const getRestProfile = (profile: UserPublicProfile) =>
  Object.fromEntries(Object.entries(profile).filter(([key]) => !PRIMARY_PROFILE_FIELDS.has(key)))

const getAvatarSource = (profile: UserPublicProfile) => {
  if (profile.avatar_url) {
    return profile.avatar_url
  }

  if (typeof profile.avatar === 'string') {
    return profile.avatar
  }

  if (isRecord(profile.avatar)) {
    if (typeof profile.avatar.preview_url === 'string') {
      return profile.avatar.preview_url
    }

    if (typeof profile.avatar.url === 'string') {
      return profile.avatar.url
    }
  }

  return undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
