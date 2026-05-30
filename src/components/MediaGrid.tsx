import { useState } from 'react'
import { Card, Empty, Flex, Image, List, Typography } from 'antd'
import type { MediaFile } from '../types/api'
import { formatDate, truncateId } from '../utils/format'

const getPreviewSource = (file: MediaFile) => file.preview_url ?? file.url

export const MediaGrid = ({ files }: { files?: MediaFile[] }) => {
  if (!files?.length) {
    return <Empty description="Медиа не приложены" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
      dataSource={files}
      renderItem={(file, index) => (
        <List.Item>
          <MediaCard file={file} index={index} />
        </List.Item>
      )}
    />
  )
}

const MediaCard = ({ file, index }: { file: MediaFile; index: number }) => {
  const [hasImagePreview, setHasImagePreview] = useState(Boolean(getPreviewSource(file)))

  return (
    <Card
      hoverable
      cover={
        hasImagePreview ? (
          <Image
            src={getPreviewSource(file)}
            alt={`Медиа ${index + 1}`}
            height={170}
            style={{ objectFit: 'cover' }}
            onError={() => setHasImagePreview(false)}
          />
        ) : (
          <Flex
            align="center"
            justify="center"
            style={{ minHeight: 170, color: '#526078', background: '#edf3fb', fontWeight: 800 }}
          >
            Файл
          </Flex>
        )
      }
      actions={[
        <a key="open" href={file.url} target="_blank" rel="noreferrer">
          Открыть файл
        </a>,
      ]}
    >
      <Card.Meta
        title={`Медиа ${index + 1}`}
        description={
          <>
            <Typography.Text type="secondary">ID: {truncateId(file.media_id)}</Typography.Text>
            <br />
            <Typography.Text type="secondary">Ссылка активна до {formatDate(file.expires_at)}</Typography.Text>
          </>
        }
      />
    </Card>
  )
}
