const EARTH_RADIUS_M = 6371000

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export const distanceMeters = (from: [number, number], to: [number, number]) => {
  const [lat1, lon1] = from
  const [lat2, lon2] = to

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  const apiKey = import.meta.env.VITE_YANDEX_GEOCODER_API_KEY?.trim()

  if (!apiKey || !address.trim()) {
    return null
  }

  const url = new URL('https://geocode-maps.yandex.ru/1.x/')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('format', 'json')
  url.searchParams.set('lang', 'ru_RU')
  url.searchParams.set('results', '1')
  url.searchParams.set('geocode', address.trim())

  const response = await fetch(url.toString())

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as {
    response?: {
      GeoObjectCollection?: {
        featureMember?: Array<{
          GeoObject?: { Point?: { pos?: string } }
        }>
      }
    }
  }

  const pos = payload.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos

  if (!pos) {
    return null
  }

  const [lon, lat] = pos.split(' ').map(Number)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  return [lat, lon]
}

