const SCRIPT_ID = 'yandex-maps-api-2-1'

export const getYandexMapsJsApiKey = () => import.meta.env.VITE_YANDEX_MAPS_JS_API_KEY?.trim() ?? ''

let loadPromise: Promise<void> | null = null

export const loadYandexMaps = (): Promise<void> => {
  const apiKey = getYandexMapsJsApiKey()

  if (!apiKey) {
    return Promise.reject(new Error('Не задан ключ VITE_YANDEX_MAPS_JS_API_KEY'))
  }

  if (typeof window !== 'undefined' && window.ymaps) {
    return Promise.resolve()
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (existing?.dataset.loaded === 'true' && window.ymaps) {
      resolve()
      return
    }

    if (existing && !window.ymaps) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => {
          loadPromise = null
          reject(new Error('Не удалось загрузить Яндекс.Карты'))
        },
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Не удалось загрузить Яндекс.Карты'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

export const whenYandexMapsReady = async () => {
  await loadYandexMaps()
  const ymaps = window.ymaps

  if (!ymaps) {
    throw new Error('API Яндекс.Карт недоступно')
  }

  await new Promise<void>((resolve) => {
    ymaps.ready(() => resolve())
  })

  return ymaps
}
