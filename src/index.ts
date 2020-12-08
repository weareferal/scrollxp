import gsap from "gsap"

import { BreakpointListener, clear } from "./utils"
import ScrollScene from "./scroll-scene"
import ScrollController from "./scroll-controller"
import SceneEvent from "./scrollmagic/scene-event"
import AnimationCreator from "./creator/animation.creator"
import TypeHelper from "./helpers/type.helper"
import Parser from "./parser"
import AnimationParser from "./parsers/animation.parser"
import SceneParser from "./parsers/scene.parser"
import ParallaxParser from "./parsers/parallax.parser"
import AnimationBuilder from "./builders/animation.builder"
import SceneBuilder from "./builders/scene.builder"
import ParallaxBuilder from "./builders/parallax.builder"
import {
  IScene,
  SceneEventVars,
  Breakpoints,
  BreakpointListenerResult,
  Descriptor,
  AnimationDescriptor,
  SceneDescriptor,
  ParallaxDescriptor,
  DefaultDescriptors,
} from "./interfaces"

declare let __SCROLLXP_VERSION__: string

export interface ScrollViewOptions {
  container?: HTMLElement | Window
  breakpoints?: Breakpoints
  smoothScrolling?: boolean
  addIndicators?: boolean
  scrollOffset?: number
  anchors?: HTMLAnchorElement[]
}

export { IScene }

export default class ScrollXP {
  static version = typeof __SCROLLXP_VERSION__ !== "undefined" ? __SCROLLXP_VERSION__ : "test"

  static Animation = AnimationBuilder
  static Scene = SceneBuilder
  static Parallax = ParallaxBuilder

  private parser: Parser

  private controller: ScrollController
  private container: HTMLElement | Window
  private content: HTMLElement
  private _smoothScrolling: boolean
  private scrollOffset: number

  private defaults: DefaultDescriptors = {}

  private registeredScenes: { [key: string]: SceneDescriptor } = {}
  private registeredAnimations: { [key: string]: AnimationDescriptor } = {}

  private domElements: HTMLElement[] = []
  private tweens: GSAPTimeline[] = []
  private scenes: ScrollScene[] = []
  private anchorScenes: ScrollScene[] = []

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

    this.parser = new Parser(options.breakpoints)

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
    }, this.parser.breakpoints)

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

  public register(data: Descriptor | Descriptor[]): void {
    if (TypeHelper.isSceneDescriptor(data)) {
      if (data.name === undefined) {
        throw new Error(`Scene is missing name, it wasn't possible to register it.`)
      }
      this.registeredScenes[data.name] = clear(data, "name")
    } else if (TypeHelper.isAnimationDescriptor(data)) {
      if (data.name === undefined) {
        throw new Error(`Animation is missing name, it wasn't possible to register it.`)
      }
      if (data.label !== undefined) {
        throw new Error(
          `Animations can't be registered with a label, it can only be set using data-* attributes. Please, review "${data.name}".`,
        )
      }
      this.registeredAnimations[data.name] = clear(data, "name")
    } else if (data instanceof Array) {
      data.forEach((item) => this.register(item))
    }
  }

  public setDefault(descriptor: Descriptor): void {
    if (TypeHelper.isAnimationDescriptor(descriptor)) {
      this.defaults.animation = descriptor
    } else if (TypeHelper.isSceneDescriptor(descriptor)) {
      this.defaults.scene = descriptor
    } else if (TypeHelper.isParallaxDescriptor(descriptor)) {
      this.defaults.parallax = descriptor
    } else {
      throw new TypeError(`Default value is not a valid descriptor: ${descriptor}`)
    }
  }

  public getRegisteredScenes(): { [key: string]: SceneDescriptor } {
    return this.registeredScenes
  }

  public getRegisteredAnimations(): { [key: string]: AnimationDescriptor } {
    return this.registeredAnimations
  }

  private rebuild(): void {
    setTimeout(() => {
      this.resetScenes()
      this.buildParallaxScenes()
      this.buildScenes()
    }, 0)
  }

  private buildScenes(): void {
    const parser = this.parser.create(SceneParser, this.defaults.scene)

    const container = this.container instanceof Window ? document.body : this.container

    const elements = parser.getElements(container)

    elements.forEach((element) => {
      let descriptor: SceneDescriptor

      // Is registered scene?
      const name = parser.getName(element)
      if (name) {
        // Creates a new parser, so the result is the following composition of descriptors:
        // Default <- Registered <- Parsed
        if (name in this.registeredScenes) {
          const newParser = this.parser.create(SceneParser, this.registeredScenes[name])
          descriptor = newParser.parse(element, container)
        } else {
          throw new Error(`Couldn't find scene "${name}". Make sure it's registered.`)
        }
      } else {
        // Parses the element, so the result is the following composition of descriptors:
        // Default <- Parsed
        descriptor = parser.parse(element, container)
      }

      if (descriptor.enabled) {
        const scene = new ScrollScene({
          triggerElement: descriptor.trigger || element,
          triggerHook: descriptor.hook,
          duration: descriptor.duration,
          reverse: descriptor.reverse,
        })

        // Add indicators?
        if (descriptor.indicator) {
          scene.addIndicators({ name: descriptor.indicator })
        }

        // onEnter callback
        if (descriptor.onEnter) {
          scene.on("enter", (vars?: SceneEventVars) => {
            if (descriptor.onEnter) {
              descriptor.onEnter(element, scene, vars)
            }
          })
        }

        // onLeave callback
        if (descriptor.onLeave) {
          scene.on("leave", (vars?: SceneEventVars) => {
            if (descriptor.onLeave) {
              descriptor.onLeave(element, scene, vars)
            }
          })
        }

        // onProgress callback
        if (descriptor.onProgress) {
          scene.on("progress", (vars?: SceneEventVars) => {
            if (descriptor.onProgress) {
              descriptor.onProgress(element, scene, vars)
            }
          })
        }

        // 1. Has class toggle?
        if (descriptor.classToggle) {
          scene.setClassToggle(element, descriptor.classToggle)
        }
        // 2. Is pinned?
        else if (descriptor.pin) {
          scene.setPin(element)
        }
        // 3. Parse animations
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

    const parser = this.parser.create(AnimationParser, this.defaults.animation)

    let easing = false

    const elements = parser.getElements(domScene)

    elements.forEach((element) => {
      let descriptor: AnimationDescriptor

      // Is registered animation?
      const name = parser.getName(element)
      if (name) {
        // Creates a new parser, so the result is the following composition of descriptors:
        // Default <- Registered <- Parsed
        if (name in this.registeredAnimations) {
          const newParser = this.parser.create(AnimationParser, this.registeredAnimations[name])
          descriptor = newParser.parse(element)
        } else {
          throw new Error(`Couldn't find animation "${name}". Make sure it's registered.`)
        }
      } else {
        // Parses the element, so the result is the following composition of descriptors:
        // Default <- Parsed
        descriptor = parser.parse(element)
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

  private buildParallaxScenes(): void {
    const parser = this.parser.create(ParallaxParser, this.defaults.parallax)

    const container = this.container instanceof Window ? document.body : this.container

    const elements = parser.getElements(container)

    const globalDescriptors: ParallaxDescriptor[] = []

    elements.forEach((element) => {
      const descriptor = parser.parse(element, container)

      if (descriptor.enabled) {
        // Global parallax
        if (descriptor.type === "global") {
          globalDescriptors.push(descriptor)

          if (globalDescriptors.length === 1) {
            const scene = new ScrollScene({
              triggerElement: this.content,
              triggerHook: "onLeave",
              duration: this.content.offsetHeight,
            }).on("update", () => {
              this.updateParallaxElements(globalDescriptors, this.controller.getScrollPos())
            })
            this.scenes.push(scene)
            this.controller.addScene(scene)
          }
        }
        // Scene parallax
        else {
          let during = false

          const scene = new ScrollScene({
            triggerElement: descriptor.trigger,
            triggerHook: descriptor.hook,
            duration: descriptor.duration,
            offset: descriptor.offset,
          })
            .on("update", (e?: SceneEvent) => {
              if (during && e?.vars?.scrollPos && e?.vars?.startPos) {
                const delta = e.vars.scrollPos - e.vars.startPos
                this.updateParallaxElements(descriptor, delta)
              }
            })
            .on("enter", () => (during = true))
            .on("leave", () => (during = false))

          if (descriptor.indicator) {
            scene.addIndicators({ name: descriptor.indicator })
          }

          this.scenes.push(scene)
          this.controller.addScene(scene)
        }
      } else {
        // In the case the parallax was disabled for this element, clear all styles
        gsap.set(element, { clearProps: "all" })
      }
    })
  }

  private updateParallaxElements(data: ParallaxDescriptor | ParallaxDescriptor[], offsetY: number) {
    if (data instanceof Array) {
      data.forEach((descriptor) => this.updateParallaxElements(descriptor, offsetY))
    } else if (data.element) {
      if (data.stagger) {
        gsap.to(data.element.children, {
          duration: data.momentum,
          y: offsetY / data.speed,
          stagger: {
            ease: data.ease,
            each: data.stagger,
          },
        })
      } else {
        if (data.momentum > 0) {
          gsap.to(data.element, data.momentum, {
            y: offsetY / data.speed,
            ease: data.ease,
          })
        } else {
          gsap.set(data.element, {
            y: offsetY / data.speed,
          })
        }
      }
    }
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
