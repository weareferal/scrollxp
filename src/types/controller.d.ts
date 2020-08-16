interface IScrollController {
  smoothScrolling: boolean
}

interface IController {
  setScrollPos(pos: number): void
}

interface ControllerInfo {
  isVertical: boolean
  isDocument: boolean
  container: HTMLElement | Window
  size: number
  scrollPos: number
  scrollDirection: string
  smoothScrolling: boolean
}

interface ControllerOptions {
  container?: HTMLElement | Window | Document
  isVertical?: boolean
  globalSceneOptions?: any // eslint-disable-line
  logLevel?: number
  refreshInterval?: number
  addIndicators?: boolean
  smoothScrolling?: boolean
}
