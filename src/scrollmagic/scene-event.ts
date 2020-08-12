import Scene, { State as SceneState } from "./scene"
import Controller, { ScrollDirection } from "./controller"

export interface SceneEventVars {
  type?: string
  what?: string
  reason?: string
  newValue?: any // eslint-disable-line
  startPos?: number
  endPos?: number
  scrollPos?: number
  progress?: number
  scrollDirection?: ScrollDirection
  state?: SceneState
  reset?: boolean
  controller?: Controller
}

export default class SceneEvent {
  type: string
  namespace?: string
  target?: Scene
  currentTarget?: Scene
  vars?: SceneEventVars
  timestamp: number

  constructor(type: string, namespace?: string, target?: Scene, vars?: SceneEventVars) {
    this.type = type
    this.namespace = namespace
    this.target = target
    this.currentTarget = target
    this.vars = vars
    this.timestamp = Date.now()
  }
}
