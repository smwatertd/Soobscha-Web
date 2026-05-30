export {}

declare global {
  interface Window {
    ymaps?: YMapsNamespace
  }
}

type YMapsNamespace = {
  ready: (callback: () => void) => void
  Map: new (
    container: HTMLElement | string,
    state: { center: [number, number]; zoom: number; controls?: string[]; behaviors?: string[] },
    options?: { suppressMapOpenBlock?: boolean },
  ) => YMap
  Placemark: new (
    geometry: [number, number],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YGeoObject
}

type YGeoObject = {
  events?: { add: (event: string, handler: () => void) => void }
}

type YMap = {
  geoObjects: { add: (object: YGeoObject) => void }
  container: { fitToViewport: () => void; getSize: () => [number, number] }
  destroy: () => void
  events: { add: (event: string, handler: (event?: unknown) => void) => void }
}
