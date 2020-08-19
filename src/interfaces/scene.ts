import { IBaseController } from "./controller"

export interface IScene {
  duration(value?: string | number | (() => number)): number
}

export interface SceneOptions {
  duration?: number | string | (() => number)
  offset?: number
  triggerElement?: HTMLElement
  triggerHook?: number | string
  reverse?: boolean
  logLevel?: number
  tweenChanges?: boolean
}

export interface SceneEventVars {
  type?: string
  what?: string
  reason?: string
  newValue?: any // eslint-disable-line
  startPos?: number
  endPos?: number
  scrollPos?: number
  progress?: number
  scrollDirection?: string
  state?: string
  reset?: boolean
  controller?: IBaseController
}

export interface SceneListener {
  namespace: string
  callback: (e?: SceneEventVars) => void
}

export interface SceneListeners {
  [eventName: string]: SceneListener[]
}

export interface ScrollOffset {
  start: number
  end: number
}

export interface PinOptions {
  spacer: HTMLElement
  inFlow: boolean
  pushFollowers: boolean
  relSize: {
    width?: boolean
    height?: boolean
    autoFullWidth?: boolean
  }
}
