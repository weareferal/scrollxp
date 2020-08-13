import { BreakpointListener } from "./utils/breakpoints"
import PropertyHelper from "./utils/property-helper"
import ScrollScene from "./scroll-scene"
import ScrollController from "./scroll-controller"
import SceneEvent from "./scrollmagic/scene-event"
import { IObject, deepMerge } from "./scrollmagic/utils"
import gsap from "gsap"
import AnimationCreator from "./creator/animation.creator"
import Parser from "./parser"
import AnimationParser from "./parsers/animation.parser"
import TypeHelper from "./helpers/type.helper"
import AnimationBuilder from "./builders/animation.builder"
import SceneParser from "./parsers/scene.parser"

declare let __SCROLLXP_VERSION__: string

export interface ViewOptions extends IObject {
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
    transformOrigin?: string
  }
}

export interface ImmutableViewOptions extends IObject {
  parallax?: {
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
  scene?: {
    name?: string
    triggerHook: number
    duration: number
    reverse: boolean
    classToggle?: string
    pin: boolean
    enabled: boolean
    indicator?: string
  }
  animation?: {
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
    transformOrigin?: string
  }
}

export interface ScrollViewOptions {
  container?: HTMLElement | Window
  breakpoints: Breakpoints
  smoothScrolling?: boolean
  defaults?: ViewOptions
  addIndicators?: boolean
  scrollOffset?: number
  anchors?: HTMLAnchorElement[]
}

export interface ParallaxItem {
  domElement: HTMLElement
  speed: number
  momentum: number
  stagger?: number
  ease?: string
  trigger?: HTMLElement
  duration?: number
  offset?: number
  hook?: number
  indicator?: string
}

export interface SceneModifier {
  (domScene: HTMLElement): { [key: string]: any } // eslint-disable-line
}

export { ScrollScene }

/**
 * !!!IMPORTANT!!!
 * 
 * How it works:
 * - The attribute [data-scene] creates a scene with duration = 0,
 *   use [data-scene-*] to change the scene
 * - The attribute [data-animate] creates an animation,
 *   use [data-animate-*] to change the animation
 * - Animations get stacked in a timeline as they are declared
 * 
 * Rules:
 * - [data-animate-*] only works inside an unregistered scene, i.e., [data-scene]
 *   (if we change that, we have trouble with nested scenes)
 * - [data-scene="NAME"] can have nested scenes (registered and unregistered)
 * - [data-scene] can have only unregistered nested scenes
 * 
 * Registering scenes and animations:
 * - Animations can be customized to be reused, we do that by registering animations
 *   JS: this.view.registerAnimation('fade-in', duration: 1, { from: { autoAlpha: 0 } });
 *   HTML: <div data-animate="fade-in"></div>
 * - Scenes can be customized to allow more control over HTML elements, we do that by registering scenes
 *   JS: this.view.registerSceneModifier("reveal", function(
          domScene
        ) {
          return {
            onEnter: function() {
              domScene.classList.add("is-visible");
            },
            triggerHook: "0.8"
          };
      HTML: <div data-scene="reveal"></div>
 */
export default class ScrollXP {
  static version = __SCROLLXP_VERSION__

  static Animation = AnimationBuilder

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
      ease: "none",
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
      transformOrigin: "50% 50%",
    },
  }
  private domElements: HTMLElement[] = []
  private tweens: GSAPTimeline[] = []
  private scenes: ScrollScene[] = []
  private anchorScenes: ScrollScene[] = []
  private sceneModifiers: { [key: string]: SceneModifier } = {}
  private registeredAnimations: { [key: string]: AnimationDescriptor } = {}
  private scrollOffset: number
  private parser: Parser

  constructor(options: ScrollViewOptions) {
    gsap.config({
      nullTargetWarn: false,
    })

    this.container = options.container || window

    this.content =
      this.container instanceof Window
        ? <HTMLElement>document.body.children[0]
        : <HTMLElement>this.container.children[0]

    this.scrollOffset = options.scrollOffset || 0

    this._smoothScrolling = options.smoothScrolling || false

    this.helper = new PropertyHelper(options.breakpoints)
    this.parser = new Parser(options.breakpoints)

    if (options.defaults) {
      this.defaults = deepMerge(this.defaults, options.defaults)
    }

    // TODO: Instead of checking for xs, check for isMobile somehow (actual devices)
    new BreakpointListener((result: BreakpointListenerResult) => {
      if (result.hasChanged) {
        // First load
        if (!this.controller) {
          this.controller = new ScrollController({
            container: this.container,
            smoothScrolling: this.smoothScrolling,
            addIndicators: options.addIndicators || false,
          })
        } else {
          // Disable smooth scrolling on mobile
          if (this.smoothScrolling) {
            if (result.screenSize === "xs") {
              this.controller.smoothScrolling = false
            } else {
              this.controller.smoothScrolling = true
            }
          }
        }

        console.debug("[ScrollView] Rebuiling scenes for:", result.screenSize)
        this.rebuild()
      }

      // Update content scene duration, so the scroll progress is adjusted
      // if (this.contentScene) {
      //   this.contentScene.duration(this.content.offsetHeight)
      // }
    }, this.helper.breakpoints)

    // Set up scrollTo anchors
    if (options.anchors && options.anchors.length > 0) {
      const anchors = Array.from(options.anchors).filter((anchor) => anchor.hash.length > 1)
      this.setUpScrollTo(anchors)
    }
  }

  public setUpScrollTo(anchors: HTMLElement[]): void {
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        anchors.forEach((anchor) => anchor.classList.remove("is-active"))

        if (e.currentTarget) {
          const currentTarget = <HTMLElement>e.currentTarget
          currentTarget.classList.add("is-active")

          const id = currentTarget.getAttribute("href")
          if (id && id.length > 0) {
            e.preventDefault()

            this.controller.scrollTo(id)
          }
        }
      })
    })
  }

  public bindAnchors(anchors: HTMLElement[]): void {
    this.setUpScrollTo(anchors)

    // Bind anchor to scroll scenes
    anchors.forEach((anchor) => {
      const id = anchor.getAttribute("href")
      if (id) {
        const section =
          this.container instanceof Window ? document.body.querySelector(id) : this.container.querySelector(id)
        if (section) {
          const elem = <HTMLElement>section

          const anchorScene = new ScrollScene({
            triggerElement: elem,
            triggerHook: "0.01", // BUGFIX: Sometimes the scene isn't triggered for 1px difference, using this value fixes the issue.
            offset: this.scrollOffset,
            duration: function () {
              return elem.offsetHeight
            },
          })
            .on("enter", () => anchor.classList.add("is-active"))
            .on("leave", () => anchor.classList.remove("is-active"))

          this.anchorScenes.push(anchorScene)

          this.controller.addScene(anchorScene)
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

  public setScrollOffset(offset: number): void {
    this.anchorScenes.forEach((scene) => scene.offset(offset))
    this.controller.setScrollOffset(offset)
  }

  public registerSceneModifier(modifierName: string, modifierFunction: SceneModifier): void {
    this.sceneModifiers[modifierName] = modifierFunction
  }

  public register(data: Descriptor | Descriptor[]): void {
    if (TypeHelper.isAnimationDescriptor(data)) {
      if (data.name === undefined) {
        throw Error(`Animation is missing name, it wasn't possible to register it.`)
      }
      if (!TypeHelper.isString(name)) {
        throw Error(`Animation name needs to be a string: "${data.name}"`)
      }
      if (data.label !== undefined) {
        throw Error(
          `Animations can't be registered with a label, it can only be set using data-* attributes. Please, review "${data.name}".`,
        )
      }
      this.registeredAnimations[data.name] = data
    } else if (data instanceof Array) {
      data.forEach((item) => this.register(item))
    }
  }

  private rebuild(): void {
    setTimeout(() => {
      this.resetScenes()
      this.buildParallaxScenes()
      this.buildScenes()
    }, 0)
  }

  private buildScenes(): void {
    const parser = this.parser.create(SceneParser)

    const container = this.container instanceof Window ? document.body : this.container

    const elements = parser.getElements(container)

    elements.forEach((element) => {
      const descriptor = parser.parse(element, container)

      if (descriptor.enabled) {
        let scene = new ScrollScene({
          triggerElement: descriptor.trigger || element,
          triggerHook: descriptor.hook,
          duration: descriptor.duration,
          reverse: descriptor.reverse,
        })

        // Add indicators?
        if (descriptor.indicator) {
          scene.addIndicators({ name: descriptor.indicator })
        }

        // 1. Has class toggle?
        if (descriptor.classToggle) {
          scene.setClassToggle(element, descriptor.classToggle)
        }
        // 2. Is pinned?
        else if (descriptor.pin) {
          scene.setPin(element)
        }
        // 3. Is registered?
        else if (descriptor.name) {
          scene = this.applySceneModifier(descriptor.name, scene, element)
        }
        // 4. Parse animations
        else {
          this.createAnimation(scene, element)
        }

        this.controller.addScene(scene)
        this.scenes.push(scene)
      }
    })
  }

  private createAnimation(scene: ScrollScene, domScene: HTMLElement): void {
    const creator = new AnimationCreator()

    const parser = this.parser.create(AnimationParser)

    let easing = false

    const elements = parser.getElements(domScene)

    elements.forEach((element) => {
      let descriptor = parser.parse(element)

      // Is registered animaton?
      if (descriptor.name) {
        if (descriptor.name in this.registeredAnimations) {
          const registeredDescriptor = this.registeredAnimations[descriptor.name]
          registeredDescriptor.label = descriptor.label
          registeredDescriptor.position = descriptor.position
          descriptor = registeredDescriptor
        } else {
          throw Error(`Couldn't find animation "${descriptor.name}". Make sure it's registered.`)
        }
      }

      // Sets flag to render scene properly
      if (descriptor.momentum > 0) {
        easing = true
      }

      // Adds the animated elements to the elements array
      if (descriptor.stagger) {
        for (let i = 0; i < element.children.length; i++) {
          this.domElements.push(<HTMLElement>element.children[i])
        }
      } else {
        this.domElements.push(element)
      }

      creator.add(element, descriptor)
    })

    const tween = creator.create()

    scene.setTween(tween, easing)

    this.tweens.push(tween)
  }

  // TODO: Refactor this. Custom scenes must be implemented outside ScrollView and applied here
  /**
   * A modifier must be registered in the scroll view in order to be applied.
   *
   * As data-* attributes can't cover eveything we want to do with scenes, we can apply custom behavior
   * to it through scene modifiers.
   *
   * @param {*} modifierName
   * @param {*} scene
   * @param {*} domScene
   */
  private applySceneModifier(modifierName: string, scene: ScrollScene, domScene: HTMLElement): ScrollScene {
    const modifierFunction = this.sceneModifiers[modifierName]

    if (modifierFunction) {
      const modifier = modifierFunction(domScene)

      if (modifier.tween !== undefined) {
        const tween = gsap.timeline().add(modifier.tween)

        scene.setTween(tween)

        this.tweens.push(tween)
      }

      if (modifier.duration !== undefined) {
        scene.duration(modifier.duration)
      }

      if (modifier.triggerHook !== undefined) {
        scene.triggerHook(modifier.triggerHook)
      }

      if (modifier.onEnter !== undefined) {
        scene.on("enter", () => {
          modifier.onEnter(scene)
        })
      }

      if (modifier.onProgress !== undefined) {
        scene.on("progress", () => {
          modifier.onProgress(scene)
        })
      }

      if (modifier.offset !== undefined) {
        scene.offset(modifier.offset)
      }

      if (modifier.pin !== undefined) {
        scene.setPin(modifier.pin)
      }

      if (modifier.reverse !== undefined) {
        scene.reverse(modifier.reverse)
      }

      this.domElements.push(domScene)
    }

    return scene
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
        this.helper.getParallaxProperty(domElement, "enabled") || `${this.defaults.parallax?.enabled}`,
      )

      if (isEnabled) {
        const speed = parseFloat(
          this.helper.getParallaxProperty(domElement, "speed") || `${this.defaults.parallax?.speed}`,
        )
        const momentum = parseFloat(
          this.helper.getParallaxProperty(domElement, "momentum") || `${this.defaults.parallax?.momentum}`,
        )
        const stagger = parseFloat(
          this.helper.getParallaxProperty(domElement, "stagger") || `${this.defaults.parallax?.stagger}`,
        )
        const ease = this.helper.getParallaxProperty(domElement, "ease") || this.defaults.parallax?.ease

        let item: ParallaxItem = {
          domElement: domElement,
          speed: speed,
          momentum: <number>momentum,
          stagger: stagger,
          ease: ease,
        }

        const parallaxType = this.helper.getParallaxProperty(domElement, "parallax") || this.defaults.parallax?.type

        // Global items
        if (parallaxType === "global") {
          globalItems.push(item)
        }
        // Scene items
        else if (parallaxType === "scene") {
          const trigger = this.helper.getParallaxProperty(domElement, "trigger") || this.defaults.parallax?.trigger
          const duration = this.helper.getParallaxProperty(domElement, "duration") || this.defaults.parallax?.duration
          const offset = this.helper.getParallaxProperty(domElement, "offset") || this.defaults.parallax?.offset
          const hook = this.helper.getParallaxProperty(domElement, "hook") || this.defaults.parallax?.hook
          const indicator =
            this.helper.getParallaxProperty(domElement, "indicator") || this.defaults.parallax?.indicator

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
        gsap.set(domElement, { clearProps: "all" })
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
      } else {
        if (item.momentum > 0) {
          gsap.to(item.domElement, item.momentum, {
            y: offsetY / item.speed,
            ease: item.ease,
          })
        } else {
          gsap.set(item.domElement, {
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

    gsap.set(this.domElements, {
      clearProps: "all",
    })

    this.tweens = []
    this.scenes = []
    this.domElements = []
  }
}
