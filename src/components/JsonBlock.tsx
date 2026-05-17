import type { JsonObject } from '../types/api'

export const JsonBlock = ({ value }: { value?: JsonObject | null }) => {
  if (!value || Object.keys(value).length === 0) {
    return <span>—</span>
  }

  return <pre className="json-block">{JSON.stringify(value, null, 2)}</pre>
}
