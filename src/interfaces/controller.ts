export interface IController {
  smoothScrolling: boolean
}

export interface IBaseController {
  setScrollPos(pos: number): void
}

export interface ControllerInfo {
  isVertical: boolean
  isDocument: boolean
  container: HTMLElement | Window
  size: number
  scrollPos: number
  scrollDirection: string
  smoothScrolling: boolean
}

export interface ControllerOptions {
  container?: HTMLElement | Window | Document
  isVertical?: boolean
  globalSceneOptions?: any // eslint-disable-line
  logLevel?: number
  refreshInterval?: number
  addIndicators?: boolean
  smoothScrolling?: boolean
}
