import { useState } from 'react'
import type { MediaFile } from '../types/api'
import { formatDate, truncateId } from '../utils/format'

const getPreviewSource = (file: MediaFile) => file.preview_url ?? file.url

export const MediaGrid = ({ files }: { files?: MediaFile[] }) => {
  if (!files?.length) {
    return <p className="muted">Медиа не приложены.</p>
  }

  return (
    <div className="media-grid">
      {files.map((file, index) => (
        <MediaCard key={file.media_id} file={file} index={index} />
      ))}
    </div>
  )
}

const MediaCard = ({ file, index }: { file: MediaFile; index: number }) => {
  const [hasImagePreview, setHasImagePreview] = useState(Boolean(getPreviewSource(file)))

  return (
    <a href={file.url} target="_blank" rel="noreferrer" className="media-card">
      <div className="media-card__preview">
        {hasImagePreview ? (
          <img
            src={getPreviewSource(file)}
            alt={`Медиа ${index + 1}`}
            loading="lazy"
            onError={() => setHasImagePreview(false)}
          />
        ) : (
          <div className="media-card__fallback">
            <span>Файл</span>
          </div>
        )}
      </div>
      <div className="media-card__body">
        <strong>Медиа {index + 1}</strong>
        <span>ID: {truncateId(file.media_id)}</span>
        <small>Ссылка активна до {formatDate(file.expires_at)}</small>
      </div>
    </a>
  )
}
