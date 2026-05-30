import { whenYandexMapsReady } from './yandexMapsLoader'

export type YandexMapHandle = {
  destroy: () => void
  container: { fitToViewport: () => void }
}

export const destroyMap = (map: YandexMapHandle | null | undefined) => {
  if (!map) {
    return
  }

  try {
    map.destroy()
  } catch {
    // карта уже уничтожена
  }
}

type CreateMapOptions = {
  zoom: number
  balloon: string
  behaviors?: string[]
  controls?: string[]
  onMapClick?: () => void
}

export const createYandexMap = async (
  container: HTMLElement,
  center: [number, number],
  options: CreateMapOptions,
): Promise<YandexMapHandle> => {
  const ymaps = await whenYandexMapsReady()

  const behaviors =
    options.behaviors && options.behaviors.length > 0
      ? options.behaviors
      : ['drag', 'scrollZoom', 'multiTouch', 'dblClickZoom']

  const pinHref = `${import.meta.env.BASE_URL}map-pin-drop.svg`

  const controls = options.controls ?? ['zoomControl', 'fullscreenControl']

  const map = new ymaps.Map(
    container,
    {
      center,
      zoom: options.zoom,
      behaviors,
      controls,
    },
    {
      suppressMapOpenBlock: true,
    },
  )

  const placemark = new ymaps.Placemark(
    center,
    {
      balloonContentHeader: 'Место заявки',
      balloonContent: options.balloon,
      hintContent: options.balloon,
    },
    {
      iconLayout: 'default#image',
      iconImageHref: pinHref,
      iconImageSize: [36, 48],
      iconImageOffset: [-18, -48],
    },
  )

  map.geoObjects.add(placemark)

  if (options.onMapClick) {
    map.events.add('click', () => {
      options.onMapClick?.()
    })
  }

  return map as YandexMapHandle
}
