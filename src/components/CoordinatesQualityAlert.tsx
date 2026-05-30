import { useEffect, useMemo, useState } from 'react'
import { Alert, Typography } from 'antd'
import { normalizeRequestCoords } from '../utils/geography'
import { distanceMeters, geocodeAddress } from '../utils/geocoder'

type CoordinatesQualityAlertProps = {
  latitude?: number | null
  longitude?: number | null
  address?: string | null
}

const WARNING_DISTANCE_METERS = 1200

export const CoordinatesQualityAlert = ({ latitude, longitude, address }: CoordinatesQualityAlertProps) => {
  const [distance, setDistance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasGeoFailure, setHasGeoFailure] = useState(false)
  const requestPoint = useMemo(() => normalizeRequestCoords(latitude, longitude), [latitude, longitude])
  const normalizedAddress = address?.trim() ?? ''

  useEffect(() => {
    if (!requestPoint || !normalizedAddress) {
      setDistance(null)
      setHasGeoFailure(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void (async () => {
      try {
        const geocoded = await geocodeAddress(normalizedAddress)

        if (cancelled) {
          return
        }

        if (!geocoded) {
          setHasGeoFailure(true)
          setDistance(null)
          return
        }

        setHasGeoFailure(false)
        setDistance(distanceMeters(requestPoint, geocoded))
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [normalizedAddress, requestPoint])

  if (!requestPoint || !normalizedAddress) {
    return null
  }

  if (isLoading) {
    return <Typography.Text type="secondary">Проверяем соответствие координат адресу...</Typography.Text>
  }

  if (hasGeoFailure) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Не удалось проверить координаты по адресу"
        description="Геокодер временно недоступен или адрес не распознан."
      />
    )
  }

  if (distance !== null && distance > WARNING_DISTANCE_METERS) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Координаты могут не совпадать с адресом"
        description={`Расхождение примерно ${Math.round(distance)} м. Проверьте точность точки на карте.`}
      />
    )
  }

  return null
}

