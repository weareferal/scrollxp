import { Breakpoints, BreakpointListener, BreakpointListenerResult } from "./utils/breakpoints"
import PropertyHelper from "./utils/property-helper"
import ScrollScene from "./scroll-scene"
import ScrollController from "./scroll-controller"
import SceneEvent from "./scrollmagic/scene-event"

declare let __SCROLLXP_VERSION__: string

export interface ViewOptions {
  parallax?: {
    enabled?: boolean
    type?: string
    speed?: number
    momentum?: number
    stagger?: string
    ease?: string
    trigger?: HTMLElement
    duration?: string | number
    offset?: number
    hook?: string | number
    indicator?: string
  }
  scene?: {
    name?: string
    triggerHook?: string | number
    duration?: string | number | (() => void)
    reverse?: boolean
    classToggle?: string
    pin?: boolean
    enabled?: boolean
    indicator?: boolean
  }
  animation: {
    name?: string
    duration?: number
    position?: string
    stagger?: number
    ease?: string
    momentum?: number
    repeat?: number
    yoyo?: boolean
    delay?: number
    label?: string
    alpha?: {
      from?: number
      to?: number
    }
    x?: {
      from?: number
      to?: number
    }
    y?: {
      from?: number
      to?: number
    }
    xPercent?: {
      from?: number
      to?: number
    }
    yPercent?: {
      from?: number
      to?: number
    }
    scale?: {
      from?: number
      to?: number
    }
    rotation?: {
      from?: number
      to?: number
    }
    width?: {
      from?: number
      to?: number
    }
  }
}

export interface ImmutableViewOptions {
  parallax: {
    enabled: boolean
    type: string
    speed: number
    momentum: number
    stagger?: number
    ease: string
    trigger: HTMLElement
    duration: string | number
    offset: number
    hook: string | number
    indicator?: string
  }
  scene: {
    name?: string
    triggerHook: number
    duration: number
    reverse: boolean
    classToggle?: string
    pin: boolean
    enabled: boolean
    indicator?: string
  }
  animation: {
    name?: string
    duration: number
    position: string
    stagger?: number
    ease?: string
    momentum?: number
    repeat: number
    yoyo: boolean
    delay: number
    label?: string
    alpha?: {
      from?: number
      to?: number
    }
    x?: {
      from?: number
      to?: number
    }
    y?: {
      from?: number
      to?: number
    }
    xPercent?: {
      from?: number
      to?: number
    }
    yPercent?: {
      from?: number
      to?: number
    }
    scale?: {
      from?: number
      to?: number
    }
    rotation?: {
      from?: number
      to?: number
    }
    width?: {
      from?: number
      to?: number
    }
  }
}

export interface ScrollViewOptions {
  container?: HTMLElement | Window
  breakpoints: Breakpoints
  smoothScrolling?: boolean
  defaults?: ViewOptions
  addIndicators?: boolean
}

export interface ParallaxItem {
  domElement: HTMLElement
  speed: number
  momentum: number
  stagger?: number
  ease: string
  trigger?: HTMLElement
  duration?: number
  offset?: number
  hook?: number
  indicator?: string
}

export default class ScrollView {
  static version = __SCROLLXP_VERSION__

  private controller: ScrollController
  private container: HTMLElement | Window
  private content: HTMLElement
  private _smoothScrolling: boolean
  private helper: PropertyHelper
  private defaults: ImmutableViewOptions = {
    parallax: {
      enabled: true,
      type: "global",
      speed: 1,
      momentum: 0.3,
      ease: "Power0.easeNone",
      trigger: document.body,
      duration: "100%",
      offset: 0,
      hook: "onCenter",
    },
    scene: {
      triggerHook: 0.5,
      duration: 0,
      reverse: true,
      pin: false,
      enabled: true,
    },
    animation: {
      duration: 1,
      position: "+=0",
      repeat: 0,
      yoyo: false,
      delay: 0,
      momentum: 0,
    },
  }
  private domElements: HTMLElement[] = []
  private tweens: TimelineMax[] = []
  private scenes: ScrollScene[] = []

  constructor(options: ScrollViewOptions) {
    this.container = options.container || window
    this.content =
      this.container instanceof Window
        ? <HTMLElement>document.body.children[0]
        : <HTMLElement>this.container.children[0]
    this._smoothScrolling = options.smoothScrolling || false
    this.helper = new PropertyHelper(options.breakpoints)
    this.defaults = Object.assign(this.defaults, options.defaults)
    this.controller = new ScrollController({
      container: this.container,
      smoothScrolling: this.smoothScrolling,
      addIndicators: options.addIndicators || false,
    })

    new BreakpointListener((result: BreakpointListenerResult) => {
      if (result.hasChanged) {
        // Disable smooth scrolling on mobile
        if (this.smoothScrolling) {
          if (result.screenSize === "xs") {
            this.controller.smoothScrolling = false
          } else {
            this.controller.smoothScrolling = true
          }
        }
        console.debug("[ScrollView] Rebuiling scenes for:", result.screenSize)
        this.rebuild()
      }
    }, this.helper.breakpoints)
  }

  public bindAnchors(anchors: HTMLElement[]): void {
    anchors.forEach((anchor) => {
      // Bind scroll to anchor
      anchor.addEventListener("click", (e: Event) => {
        const target = <HTMLElement>e.currentTarget
        const id = target.getAttribute("href")
        if (id && id.length > 0) {
          e.preventDefault()

          this.controller.scrollTo(id)
        }
      })
      // Bind anchor to scroll
      const id = anchor.getAttribute("href")
      if (id) {
        const section =
          this.container instanceof Window ? document.body.querySelector(id) : this.container.querySelector(id)
        if (section) {
          const elem = <HTMLElement>section
          this.controller.addScene(
            new ScrollScene({
              triggerElement: elem,
              triggerHook: "onLeave",
              duration: elem.offsetHeight,
            })
              .on("enter", () => anchor.classList.add("is-active"))
              .on("leave", () => anchor.classList.remove("is-active")),
          )
        }
      }
    })
  }

  get smoothScrolling(): boolean {
    return this._smoothScrolling
  }

  set smoothScrolling(newValue: boolean) {
    this.controller.smoothScrolling = newValue
    this.rebuild()
  }

  private rebuild(): void {
    setTimeout(() => {
      this.resetScenes()
      this.buildParallaxScenes()
      this.buildScenes()
    }, 0)
  }

  private buildScenes(): void {
    const domScenes =
      this.container instanceof Window
        ? document.body.querySelectorAll("[data-scene]")
        : this.container.querySelectorAll("[data-scene]")

    domScenes.forEach((scene) => {
      const domScene = <HTMLElement>scene

      const isEnabled = eval(this.helper.getSceneProperty(domScene, "enabled") || `${this.defaults.scene.enabled}`)

      if (isEnabled) {
        const trigger = this.helper.getSceneProperty(domScene, "trigger")
        let triggerElement
        if (trigger) {
          triggerElement =
            this.container instanceof Window
              ? document.body.querySelector(trigger)
              : this.container.querySelector(trigger)
        }
        const scene = new ScrollScene({
          triggerElement: triggerElement || domScene,
          triggerHook: this.helper.getSceneProperty(domScene, "hook") || this.defaults.scene.triggerHook,
          duration: this.helper.getSceneProperty(domScene, "duration") || this.defaults.scene.duration,
          reverse: eval(this.helper.getSceneProperty(domScene, "reverse") || `${this.defaults.scene.reverse}`),
        })

        scene.triggerElement()

        const indicator = this.helper.getSceneProperty(domScene, "indicator") || this.defaults.scene.indicator
        if (indicator) {
          scene.addIndicators({ name: indicator })
        }

        const classToggle = this.helper.getSceneProperty(domScene, "class-toggle") || this.defaults.scene.classToggle
        const pin = this.helper.getSceneProperty(domScene, "pin") || this.defaults.scene.pin
        // const sceneName = this.helper.getSceneProperty(domScene, "scene", this.defaults.scene.name)

        if (classToggle) {
          scene.setClassToggle(domScene, classToggle)
        } else if (pin) {
          scene.setPin(domScene)
          // } else if (sceneName) {
          // this.createCustomAnimation(scene, domScene, sceneName)
        } else {
          this.createAnimation(scene, domScene)
        }

        this.controller.addScene(scene)
        this.scenes.push(scene)
      }
    })
  }

  private createAnimation(scene: ScrollScene, domScene: HTMLElement): void {
    const tween = new TimelineMax().add("start")

    const domElements = domScene.querySelectorAll("[data-animate]")

    let easing = false

    domElements.forEach((elem) => {
      const domElement = <HTMLElement>elem

      const animation = this.helper.getAnimationProperty(domElement, "animate") || this.defaults.animation.name

      const animationProps = {
        autoAlpha: {
          from: this.helper.getAnimationProperty(domElement, "from-alpha") || this.defaults.animation.alpha?.from,
          to: this.helper.getAnimationProperty(domElement, "to-alpha") || this.defaults.animation.alpha?.to,
        },
        x: {
          from: this.helper.getAnimationProperty(domElement, "from-x") || this.defaults.animation.x?.from,
          to: this.helper.getAnimationProperty(domElement, "to-x") || this.defaults.animation.x?.to,
        },
        y: {
          from: this.helper.getAnimationProperty(domElement, "from-y") || this.defaults.animation.y?.from,
          to: this.helper.getAnimationProperty(domElement, "to-y") || this.defaults.animation.y?.to,
        },
        xPercent: {
          from:
            this.helper.getAnimationProperty(domElement, "from-x-percent") || this.defaults.animation.xPercent?.from,
          to: this.helper.getAnimationProperty(domElement, "to-x-percent") || this.defaults.animation.xPercent?.to,
        },
        yPercent: {
          from:
            this.helper.getAnimationProperty(domElement, "from-y-percent") || this.defaults.animation.yPercent?.from,
          to: this.helper.getAnimationProperty(domElement, "to-y-percent") || this.defaults.animation.yPercent?.to,
        },
        scale: {
          from: this.helper.getAnimationProperty(domElement, "from-scale") || this.defaults.animation.scale?.from,
          to: this.helper.getAnimationProperty(domElement, "to-scale") || this.defaults.animation.scale?.to,
        },
        rotation: {
          from: this.helper.getAnimationProperty(domElement, "from-rotation") || this.defaults.animation.rotation?.from,
          to: this.helper.getAnimationProperty(domElement, "to-rotation") || this.defaults.animation.rotation?.to,
        },
        width: {
          from: this.helper.getAnimationProperty(domElement, "from-width") || this.defaults.animation.width?.from,
          to: this.helper.getAnimationProperty(domElement, "to-width") || this.defaults.animation.width?.to,
        },
      }

      const duration = parseFloat(
        this.helper.getAnimationProperty(domElement, "duration") || `${this.defaults.animation.duration}`,
      )
      const position = this.helper.getAnimationProperty(domElement, "position") || this.defaults.animation.position
      const stagger = parseFloat(
        this.helper.getAnimationProperty(domElement, "stagger") || `${this.defaults.animation.stagger}`,
      )
      const label = this.helper.getAnimationProperty(domElement, "label") || this.defaults.animation.label

      const fromProps = this.buildState("from", animationProps)
      const toProps = this.buildState("to", animationProps)

      let extraProps = {
        repeat: eval(this.helper.getAnimationProperty(domElement, "repeat") || `${this.defaults.animation.repeat}`),
        yoyo: eval(this.helper.getAnimationProperty(domElement, "yoyo") || `${this.defaults.animation.yoyo}`),
        delay: eval(this.helper.getAnimationProperty(domElement, "delay") || `${this.defaults.animation.delay}`),
      }

      const ease = eval(this.helper.getAnimationProperty(domElement, "ease") || `${this.defaults.animation.ease}`)
      const momentum = parseFloat(
        this.helper.getAnimationProperty(domElement, "momentum") || `${this.defaults.animation.momentum}`,
      )

      if (momentum > 0) {
        extraProps = Object.assign(extraProps, {
          data: {
            ease: ease,
            momentum: momentum,
          },
        })
        easing = true
      } else {
        extraProps = Object.assign(extraProps, {
          ease: ease,
        })
      }

      if (!animation) {
        const hasProperties = fromProps || toProps
        if (hasProperties) {
          if (stagger) {
            if (fromProps && toProps) {
              tween.fromTo(
                domElement.children,
                fromProps,
                Object.assign(
                  {
                    duration: duration,
                    stagger: stagger,
                  },
                  toProps,
                  extraProps,
                ),
                position,
              )
            } else if (fromProps) {
              tween.from(
                domElement.children,
                Object.assign({ duration: duration, stagger: stagger }, fromProps, extraProps),
                position,
              )
            } else {
              tween.to(
                domElement.children,
                Object.assign({ duration: duration, stagger: stagger }, toProps, extraProps),
                position,
              )
            }
            for (let i = 0; i < domElement.children.length; i++) {
              const element = domElement.children[i]
              this.domElements.push(<HTMLElement>element)
            }
          } else {
            if (fromProps && toProps) {
              tween.fromTo(domElement, fromProps, Object.assign({ duration: duration }, toProps, extraProps), position)
            } else if (fromProps) {
              tween.from(domElement, Object.assign({ duration: duration }, fromProps, extraProps), position)
            } else {
              tween.to(domElement, Object.assign({ duration: duration }, toProps, extraProps), position)
            }
            this.domElements.push(domElement)
          }
        }
      }

      if (label) {
        tween.add(label)
      }
    })

    scene.setTween(tween, easing)

    this.tweens.push(tween)
  }

  private buildParallaxScenes(): void {
    const globalItems: ParallaxItem[] = []
    const sceneItems: ParallaxItem[] = []

    const domElements =
      this.container instanceof Window
        ? document.body.querySelectorAll("[data-parallax]")
        : this.container.querySelectorAll("[data-parallax]")

    domElements.forEach((elem) => {
      const domElement = <HTMLElement>elem

      const isEnabled: boolean = eval(
        this.helper.getParallaxProperty(domElement, "enabled") || `${this.defaults.parallax.enabled}`,
      )

      if (isEnabled) {
        const speed = parseFloat(
          this.helper.getParallaxProperty(domElement, "speed") || `${this.defaults.parallax.speed}`,
        )
        const momentum = parseFloat(
          this.helper.getParallaxProperty(domElement, "momentum") || `${this.defaults.parallax.momentum}`,
        )
        const stagger = parseFloat(
          this.helper.getParallaxProperty(domElement, "stagger") || `${this.defaults.parallax.stagger}`,
        )
        const ease = eval(this.helper.getParallaxProperty(domElement, "ease") || `${this.defaults.parallax.ease}`)

        let item: ParallaxItem = {
          domElement: domElement,
          speed: speed,
          momentum: <number>momentum,
          stagger: stagger,
          ease: ease,
        }

        const parallaxType = this.helper.getParallaxProperty(domElement, "parallax") || this.defaults.parallax.type

        // Global items
        if (parallaxType === "global") {
          globalItems.push(item)
        }
        // Scene items
        else if (parallaxType === "scene") {
          const trigger = this.helper.getParallaxProperty(domElement, "trigger") || this.defaults.parallax.trigger
          const duration = this.helper.getParallaxProperty(domElement, "duration") || this.defaults.parallax.duration
          const offset = this.helper.getParallaxProperty(domElement, "offset") || this.defaults.parallax.offset
          const hook = this.helper.getParallaxProperty(domElement, "hook") || this.defaults.parallax.hook
          const indicator = this.helper.getParallaxProperty(domElement, "indicator") || this.defaults.parallax.indicator

          item = Object.assign(item, {
            trigger: trigger,
            duration: duration,
            offset: offset,
            hook: hook,
            indicator: indicator,
          })

          sceneItems.push(item)
        }
      } else {
        TweenMax.set(domElement, { clearProps: "all" })
      }
    })

    if (globalItems.length > 0) {
      this.buildGlobalParallax(globalItems)
    }

    if (sceneItems.length > 0) {
      this.buildScenesParallax(sceneItems)
    }
  }

  private buildGlobalParallax(items: ParallaxItem[]): void {
    const scene = new ScrollScene({
      triggerElement: this.content,
      triggerHook: "onLeave",
      duration: this.content.offsetHeight,
    }).on("update", () => {
      this.updateParallaxItems(items, this.controller.getScrollPos())
    })

    this.scenes.push(scene)
    this.controller.addScene(scene)
  }

  private buildScenesParallax(items: ParallaxItem[]): void {
    items.forEach((item) => {
      let during = false

      const scene = new ScrollScene({
        triggerElement: item.trigger,
        triggerHook: item.hook,
        duration: item.duration,
        offset: item.offset,
      })
        .on("update", (e?: SceneEvent) => {
          if (during && e?.vars?.scrollPos && e?.vars?.startPos) {
            const delta = e.vars.scrollPos - e.vars.startPos

            this.updateParallaxItems([item], delta)
          }
        })
        .on("enter", () => (during = true))
        .on("leave", () => (during = false))

      if (item.indicator) {
        scene.addIndicators({ name: item.indicator })
      }

      this.scenes.push(scene)
      this.controller.addScene(scene)
    })
  }

  private updateParallaxItems(items: ParallaxItem[], offsetY: number): void {
    items.forEach((item) => {
      if (item.stagger) {
        gsap.to(item.domElement.children, {
          duration: item.momentum,
          y: offsetY / item.speed,
          stagger: {
            ease: item.ease,
            each: item.stagger,
          },
        })
        // TweenMax.staggerTo(
        //   item.domElement.children,
        //   item.momentum,
        //   {
        //     y: offsetY / item.speed,
        //     ease: item.ease,
        //   },
        //   item.stagger,
        // )
      } else {
        if (item.momentum > 0) {
          TweenMax.to(item.domElement, item.momentum, {
            y: offsetY / item.speed,
            ease: item.ease,
          })
        } else {
          TweenMax.set(item.domElement, {
            y: offsetY / item.speed,
          })
        }
      }
    })
  }

  private resetScenes(): void {
    this.tweens.forEach((tween) => tween.clear())

    this.scenes.forEach((scene) => {
      scene.removePin(true)
      this.controller.removeScene(scene)
    })

    TweenMax.set(this.domElements, {
      clearProps: "all",
    })

    this.tweens = []
    this.scenes = []
    this.domElements = []
  }

  private buildState(stateKey: string, properties: any): any {
    let state
    Object.keys(properties).forEach((key) => {
      if (properties[key][stateKey] !== undefined) {
        if (!state) {
          state = {}
        }
        state[key] = properties[key][stateKey]
      }
    })
    return state
  }
}
