import Controller from "./controller"
import Scene from "./scene"

declare let __SCROLLMAGIC_VERSION__: string

export default class ScrollMagic {
  static version = __SCROLLMAGIC_VERSION__

  static Controller = Controller
  static Scene = Scene
}
