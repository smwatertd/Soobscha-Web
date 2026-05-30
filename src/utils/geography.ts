export const normalizeRequestCoords = (latitude: unknown, longitude: unknown): [number, number] | null => {
  const lat = Number(latitude)
  const lon = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null
  }

  return [lat, lon]
}
