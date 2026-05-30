import type { ReactNode } from 'react'
import { MailOutlined, LinkOutlined, PhoneOutlined } from '@ant-design/icons'
import { Space, Typography } from 'antd'
import type { ApplicantContact, ApplicantContactChannel } from '../types/api'
import { CONTACT_CHANNEL_TYPES, labelOrValue } from '../utils/labels'
import { humanizeKey } from '../utils/humanize'
import { PhoneLink } from './PhoneLink'

type ApplicantContactsPanelProps = {
  contact?: ApplicantContact | null
  compact?: boolean
  emptyText?: string
}

export const ApplicantContactsPanel = ({
  contact,
  compact = false,
  emptyText = 'Контакты не указаны.',
}: ApplicantContactsPanelProps) => {
  const rows = buildContactRows(contact)

  if (!rows.length) {
    return <Typography.Text type="secondary">{emptyText}</Typography.Text>
  }

  return (
    <div className={compact ? 'applicant-contacts applicant-contacts--compact' : 'applicant-contacts'}>
      {rows.map((row) => (
        <div className="applicant-contact-row" key={row.key}>
          <Typography.Text className="applicant-contact-row__label">{row.label}</Typography.Text>
          <div className="applicant-contact-row__value">{row.value}</div>
        </div>
      ))}
    </div>
  )
}

const buildContactRows = (contact?: ApplicantContact | null) => {
  if (!contact) {
    return []
  }

  const rows: Array<{ key: string; label: string; value: ReactNode }> = []

  if (contact.phone_number) {
    rows.push({
      key: 'phone',
      label: 'Телефон',
      value: (
        <Space size={6}>
          <PhoneOutlined />
          <PhoneLink phone={contact.phone_number} />
        </Space>
      ),
    })
  }

  contact.contact_channels?.forEach((channel, index) => {
    rows.push({
      key: `${channel.type}-${index}`,
      label: getChannelLabel(channel),
      value: (
        <Space size={6}>
          {getChannelIcon(channel.type)}
          <ContactChannelValue channel={channel} />
        </Space>
      ),
    })
  })

  return rows
}

const getChannelLabel = (channel: ApplicantContactChannel) =>
  channel.label?.trim() ||
  labelOrValue(CONTACT_CHANNEL_TYPES, channel.type) ||
  humanizeKey(channel.type)

const getChannelIcon = (type: string) => {
  if (type === 'email') {
    return <MailOutlined />
  }

  if (type === 'phone') {
    return <PhoneOutlined />
  }

  return <LinkOutlined />
}

const ContactChannelValue = ({ channel }: { channel: ApplicantContactChannel }) => {
  const value = channel.value.trim()

  if (!value) {
    return <>—</>
  }

  if (channel.type === 'phone' || isPhoneValue(value)) {
    return <PhoneLink phone={value} />
  }

  if (channel.type === 'email' || value.includes('@')) {
    return (
      <Typography.Link href={`mailto:${value}`} className="contact-link">
        {value}
      </Typography.Link>
    )
  }

  if (/^https?:\/\//i.test(value)) {
    return (
      <Typography.Link href={value} target="_blank" rel="noreferrer" className="contact-link">
        {value}
      </Typography.Link>
    )
  }

  return <Typography.Text>{value}</Typography.Text>
}

const isPhoneValue = (value: string) => /^[+]?[\d\s()-]{7,}$/.test(value)
