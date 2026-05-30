const toBase64 = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')

  return normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
}

export const getJwtExpiryMs = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(toBase64(token.split('.')[1] ?? ''))) as { exp?: unknown }

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export const isJwtExpiringSoon = (token: string, bufferMs = 60_000) => {
  const expiryMs = getJwtExpiryMs(token)

  if (!expiryMs) {
    return true
  }

  return Date.now() >= expiryMs - bufferMs
}
