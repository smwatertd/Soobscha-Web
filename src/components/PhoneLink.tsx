import { Typography } from 'antd'
import { normalizeTelHref } from '../utils/format'

export const PhoneLink = ({ phone }: { phone?: string | null }) => {
  if (!phone) {
    return <>—</>
  }

  return (
    <Typography.Link href={`tel:${normalizeTelHref(phone)}`} className="phone-link">
      {phone}
    </Typography.Link>
  )
}
