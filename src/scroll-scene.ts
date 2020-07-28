import Scene, { SceneOptions } from "./scrollmagic/scene"
import ScrollController from "./scroll-controller"
import { IndicatorOptions } from "./scrollmagic/indicator"
import { ScrollListener, ScrollStatus } from "smooth-scrollbar/interfaces"
import { SceneEventVars } from "./scrollmagic/scene-event"

export interface ScrollOffset {
  x: number
  y: number
}

export interface PinScrollListener extends ScrollListener {
  (status?: ScrollStatus): void
}

export default class ScrollScene {
  private scene: Scene
  private controller: ScrollController | undefined
  private pinnedElement: HTMLElement
  private pinnedEnterListener: (e?: SceneEventVars) => void
  private pinnedLeaveListener: (e?: SceneEventVars) => void
  private pinnedScrollListener: PinScrollListener

  constructor(options: SceneOptions) {
    this.scene = new Scene(options)
    return this
  }

  public triggerElement(value?: string | HTMLElement): HTMLElement | undefined {
    if (value !== undefined) {
      this.scene.triggerElement = this.scene.validateTriggerElement(value)
    }
    return this.scene.triggerElement
  }

  public triggerHook(value?: string | number): number {
    if (value !== undefined) {
      this.scene.triggerHook = this.scene.validateTriggerHook(value)
    }
    return this.scene.triggerHook
  }

  public duration(value?: string | number | (() => number)): number {
    if (value !== undefined) {
      this.scene.duration = this.scene.validateDuration(value)
    }
    return this.scene.duration
  }

  public progress(value?: number): number {
    if (value !== undefined) {
      this.scene.progress = value
    }
    return this.scene.progress
  }

  public setTween(tween: TweenMax | TimelineMax): ScrollScene {
    this.scene.setTween(tween)
    return this
  }

  public setClassToggle(element: HTMLElement | string, classes: string): ScrollScene {
    this.scene.setClassToggle(element, classes)
    return this
  }

  public setPin(element: HTMLElement): ScrollScene {
    this.pinnedElement = element
    return this
  }

  public removePin(reset?: boolean): ScrollScene {
    this.scene.removePin(reset)
    return this
  }

  public on(names: string, callback: (e?: SceneEventVars) => void): ScrollScene {
    this.scene.on(names, callback)
    return this
  }

  public addIndicators(options?: IndicatorOptions): ScrollScene {
    this.scene.addIndicators(options)
    return this
  }

  public addTo(controller: ScrollController): ScrollScene {
    this.controller = controller

    if (this.pinnedElement) {
      /**
       * Workaround
       *
       * Only in the case we're using smooth scrolling.
       *
       * Since transform creates a new local coordinate system, position: fixed is fixed to the origin
       * of scrollbar content container, i.e. the left: 0, top: 0 point.
       *
       * Therefore, we need to apply offsets to make it work properly.
       * https://github.com/idiotWu/smooth-scrollbar/issues/49#issuecomment-265358197
       */
      if (this.controller.smoothScrolling) {
        let elementPosY = 0

        this.pinnedScrollListener = (status: ScrollStatus) => {
          if (elementPosY === 0 && this.scene.triggerElement) {
            const elementOffsetY = this.pinnedElement.getBoundingClientRect().top
            const triggerOffsetY = this.scene.triggerElement.getBoundingClientRect().top
            const triggerPosY = this.scene.duration * this.scene.triggerHook

            elementPosY = elementOffsetY - triggerOffsetY + triggerPosY
          }

          const scrollPosY = status.offset.y

          const top = elementPosY + scrollPosY
          const width = parseInt(`${this.pinnedElement.getBoundingClientRect().width}`)

          this.pinnedElement.style.position = "fixed"
          this.pinnedElement.style.top = `${top}px`
          this.pinnedElement.style.width = `${width}px`
        }

        this.pinnedEnterListener = () => this.controller?.addScrollbarListener(this.pinnedScrollListener)
        this.pinnedLeaveListener = () => this.controller?.removeScrollbarListener(this.pinnedScrollListener)

        this.scene.on("enter", this.pinnedEnterListener)
        this.scene.on("leave", this.pinnedLeaveListener)
      } else {
        this.scene.setPin(this.pinnedElement)
      }
    }

    this.scene.addTo(controller.controller)

    return this
  }

  public remove(): ScrollScene {
    this.scene.remove()

    /**
     * Workaround
     *
     * Only in the case we're using smooth scrolling.
     *
     * Since we're adding listeners to emulate the same pin feature that ScrollMagic has, when removing the scene,
     * we need to remove these listeners and reset the element position.
     */
    if (this.pinnedElement && this.controller && this.controller.smoothScrolling) {
      this.scene.off("enter", this.pinnedEnterListener)
      this.scene.off("leave", this.pinnedLeaveListener)

      this.controller.removeScrollbarListener(this.pinnedScrollListener)

      this.pinnedElement.style.position = ""
      this.pinnedElement.style.top = ""
      this.pinnedElement.style.width = ""
    }

    this.controller = undefined

    return this
  }

  public refresh(): ScrollScene {
    this.scene.refresh
    return this
  }
}
