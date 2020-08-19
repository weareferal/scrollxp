import Scene from "./scene"
import { SceneEventVars } from "../interfaces"

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
