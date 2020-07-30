import ScrollScene, { PinScrollListener } from "./scroll-scene"
import Controller, { ControllerOptions } from "./scrollmagic/controller"
import Scrollbar from "smooth-scrollbar"
import { ScrollListener } from "smooth-scrollbar/interfaces"

export interface ScrollControllerOptions extends ControllerOptions {
  container?: Window | HTMLElement
  smoothScrolling?: boolean
}

export default class ScrollController {
  private scenes: ScrollScene[] = []
  private container: HTMLElement | Window
  private options: ScrollControllerOptions
  private scrollbar: Scrollbar
  private scrollbarListeners: ScrollListener[] = []

  private _smoothScrolling: boolean

  public controller: Controller

  constructor(options: ScrollControllerOptions) {
    this.options = options
    this.container = options.container || window
    this.smoothScrolling = options.smoothScrolling || false

    // Scroll to when loading page with hashtag
    // https://github.com/idiotWu/smooth-scrollbar/issues/128#issuecomment-390980479
    const hash = location.hash
    if (hash) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.container?.scrollTo(0, 0)
          if (this.smoothScrolling) {
            const elem = document.querySelector(hash)
            if (elem) {
              this.scrollbar.scrollIntoView(<HTMLElement>elem, {
                offsetTop: -this.scrollbar.containerEl.scrollTop,
              })
            }
          } else {
            this.controller.scrollTo(hash)
          }
        }, 0)
      })
    }
  }

  get smoothScrolling(): boolean {
    return this._smoothScrolling
  }

  set smoothScrolling(newValue: boolean) {
    this.removeAllScenes()
    this.destroyController()

    this._smoothScrolling = newValue

    if (this._smoothScrolling) {
      console.debug("[ScrollController] Smooth scrolling activated")

      this.controller = new Controller(Object.assign(this.options, { refreshInterval: 0 }))

      this.createScrollbars()
    } else {
      console.debug("[ScrollController] Common scrolling activated")

      this.controller = new Controller(this.options)

      this.controller.scrollTo(function (this: HTMLElement, newPos: number) {
        TweenMax.to(this, 2, {
          scrollTo: {
            y: newPos,
          },
          ease: Power4.easeOut,
        })
      })

      this.removeScrollbars()
    }

    this.addAllScenes()
  }

  public scrollTo(targetId: string): void {
    if (this.smoothScrolling) {
      const element =
        this.container instanceof Window
          ? <HTMLElement>document.body.querySelector(targetId)
          : <HTMLElement>this.container.querySelector(targetId)
      if (element) {
        this.scrollbar.scrollIntoView(element)
      }
    } else {
      this.controller.scrollTo(targetId)
    }
  }

  public getScrollPos(): number {
    if (this.smoothScrolling) {
      return this.scrollbar.offset.y
    }
    return this.controller.scrollPos()
  }

  public addScene(scene: ScrollScene): void {
    scene.addTo(this)
    this.scenes.push(scene)
  }

  public removeScene(scene: ScrollScene): void {
    scene.remove()

    this.scenes = this.scenes.filter(function (current) {
      return current !== scene
    })
  }

  public addScrollbarListener(listener: PinScrollListener): void {
    if (this.scrollbar) {
      this.scrollbar.addListener(listener)

      this.scrollbarListeners.push(listener)
    }
  }

  public removeScrollbarListener(listener: PinScrollListener): void {
    if (this.scrollbar) {
      this.scrollbar.removeListener(listener)

      this.scrollbarListeners = this.scrollbarListeners.filter(function (current) {
        return current !== listener
      })
    }
  }

  private createScrollbars() {
    let container: HTMLElement
    if (this.container instanceof Window) {
      container = document.body
    } else {
      container = <HTMLElement>this.container
    }
    this.scrollbar = Scrollbar.init(container, {
      damping: 0.05,
    })

    this.addScrollbarListener(() => this.scenes.forEach((scene) => scene.refresh()))
  }

  private removeScrollbars(): void {
    if (this.scrollbar) {
      this.scrollbarListeners.forEach((listener) => this.scrollbar.removeListener(listener))
      this.scrollbarListeners = []
      this.scrollbar.destroy()
    }
  }

  private addAllScenes(): void {
    this.scenes.forEach((scene) => scene.addTo(this))
  }

  private removeAllScenes(): void {
    this.scenes.forEach((scene) => scene.remove())
  }

  private destroyController(): null {
    if (this.controller) {
      if (this.smoothScrolling) {
        console.debug("[Controller] Removed smooth scrolling")
      } else {
        console.debug("[Controller] Removed common scrolling")
      }
      this.controller.destroy(true)
    }
    return null
  }
}
