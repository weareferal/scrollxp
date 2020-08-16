interface IScrollScene {
  duration(value?: string | number | (() => number)): number
}

interface SceneOptions {
  duration?: number | string | (() => number)
  offset?: number
  triggerElement?: HTMLElement
  triggerHook?: number | string
  reverse?: boolean
  logLevel?: number
  tweenChanges?: boolean
}

interface SceneEventVars {
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
  controller?: IController
}

interface SceneListener {
  namespace: string
  callback: (e?: SceneEventVars) => void
}

interface SceneListeners {
  [eventName: string]: SceneListener[]
}

interface ScrollOffset {
  start: number
  end: number
}

interface PinOptions {
  spacer: HTMLElement
  inFlow: boolean
  pushFollowers: boolean
  relSize: {
    width?: boolean
    height?: boolean
    autoFullWidth?: boolean
  }
}
