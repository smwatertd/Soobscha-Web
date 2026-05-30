import { useEffect, useRef } from 'react'
import { useDataRefresh } from '../realtime/DataRefreshContext'

export const useRealtimeRefresh = (callback: () => void | Promise<void>, deps: unknown[]) => {
  const { tick } = useDataRefresh()
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  useEffect(() => {
    if (tick === 0) {
      return
    }

    void callbackRef.current()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick-driven refresh; deps mirror the wrapped callback
  }, [tick, ...deps])
}
