import { Modal, Typography } from 'antd'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { normalizeRequestCoords } from '../utils/geography'
import { createYandexMap, destroyMap, type YandexMapHandle } from '../utils/yandexMapInstance'
import { getYandexMapsJsApiKey } from '../utils/yandexMapsLoader'

type SocialRequestLocationMapProps = {
  latitude?: number | null
  longitude?: number | null
  addressLine?: string | null
}

export const SocialRequestLocationMap = ({ latitude, longitude, addressLine }: SocialRequestLocationMapProps) => {
  const center = normalizeRequestCoords(latitude, longitude)
  const apiKey = getYandexMapsJsApiKey()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMapReady, setModalMapReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const modalContainerRef = useRef<HTMLDivElement>(null)
  const previewMapRef = useRef<YandexMapHandle | null>(null)
  const modalMapRef = useRef<YandexMapHandle | null>(null)
  const openLargeMapRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    openLargeMapRef.current = () => {
      setModalOpen(true)
    }
  }, [])

  const balloon = addressLine?.trim() || 'Точка социальной заявки'

  useEffect(() => {
    if (!center || !apiKey) {
      return
    }

    const el = previewContainerRef.current

    if (!el) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        setLoadError(null)
        destroyMap(previewMapRef.current)
        previewMapRef.current = null
        const map = await createYandexMap(el, center, {
          zoom: 15,
          balloon,
          behaviors: ['drag', 'multiTouch'],
          controls: ['zoomControl', 'fullscreenControl'],
          onMapClick: () => {
            openLargeMapRef.current()
          },
        })

        if (cancelled) {
          destroyMap(map)
          return
        }

        previewMapRef.current = map
      } catch (mapError) {
        if (!cancelled) {
          setLoadError(mapError instanceof Error ? mapError.message : 'Не удалось показать карту')
        }
      }
    })()

    return () => {
      cancelled = true
      destroyMap(previewMapRef.current)
      previewMapRef.current = null
    }
  }, [apiKey, balloon, center])

  useLayoutEffect(() => {
    if (!modalOpen || !modalMapReady || !center || !apiKey) {
      return
    }

    const el = modalContainerRef.current

    if (!el) {
      return
    }

    let cancelled = false

    const run = () => {
      void (async () => {
        try {
          destroyMap(modalMapRef.current)
          modalMapRef.current = null
          el.innerHTML = ''
          const map = await createYandexMap(el, center, {
            zoom: 16,
            balloon,
            behaviors: ['drag', 'scrollZoom', 'multiTouch', 'dblClickZoom'],
            controls: ['zoomControl', 'fullscreenControl'],
          })

          if (cancelled) {
            destroyMap(map)
            return
          }

          modalMapRef.current = map
          window.setTimeout(() => {
            map.container.fitToViewport()
          }, 100)
        } catch (mapError) {
          if (!cancelled) {
            setLoadError(mapError instanceof Error ? mapError.message : 'Не удалось показать карту')
          }
        }
      })()
    }

    const timer = window.setTimeout(run, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      destroyMap(modalMapRef.current)
      modalMapRef.current = null
    }
  }, [apiKey, balloon, center, modalMapReady, modalOpen])

  if (!center) {
    return null
  }

  if (!apiKey) {
    return (
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Карта недоступна: задайте переменную окружения{' '}
        <Typography.Text code>VITE_YANDEX_MAPS_JS_API_KEY</Typography.Text> (см. <Typography.Text code>.env.example</Typography.Text>).
      </Typography.Paragraph>
    )
  }

  return (
    <>
      <div className="social-request-map">
        <div className="social-request-map__preview-wrap">
          <div ref={previewContainerRef} className="social-request-map__preview" />
        </div>
        {loadError ? (
          <Typography.Paragraph type="danger" style={{ marginTop: 8, marginBottom: 0 }}>
            {loadError}
          </Typography.Paragraph>
        ) : null}
      </div>
      <Modal
        title="Место заявки на карте"
        open={modalOpen}
        rootClassName="social-request-map-modal"
        onCancel={() => {
          setModalOpen(false)
          setModalMapReady(false)
        }}
        footer={null}
        width={960}
        destroyOnHidden
        centered
        maskClosable
        afterOpenChange={(opened) => {
          setModalMapReady(opened)

          if (!opened) {
            destroyMap(modalMapRef.current)
            modalMapRef.current = null

            const el = modalContainerRef.current

            if (el) {
              el.innerHTML = ''
            }
          }
        }}
        styles={{ body: { paddingTop: 8 } }}
      >
        <div ref={modalContainerRef} className="social-request-map__modal-map" />
      </Modal>
    </>
  )
}
