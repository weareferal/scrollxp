import gsap from "gsap"

import Logger from "../scrollmagic/utils/logger"

export default class AnimationCreator {
  private timeline: TimelineMax

  constructor() {
    this.timeline = gsap.timeline().add("start")
  }

  /**
   * Adds animation to Timeline.
   *
   * @param {HTMLElement} - The element that will be animated, if a stagger property is set, its children will be animated instead
   * @param {AnimationDescriptor} - Object with the animation properties
   *
   * @returns {AnimationCreator} - Same instance
   */
  public add(element: HTMLElement, descriptor: AnimationDescriptor): AnimationCreator {
    const target = descriptor.stagger ? element.children : element

    if (descriptor.delay) {
      this.timeline.delay(descriptor.delay)
    }

    if (this.hasFromVars(descriptor) && this.hasToVars(descriptor)) {
      const fromVars = this.getFromVars(descriptor, true)
      const toVars = this.getToVars(descriptor)
      this.timeline.fromTo(target, fromVars, toVars, descriptor.position)
    } else if (this.hasFromVars(descriptor)) {
      const fromVars = this.getFromVars(descriptor)
      this.timeline.from(target, fromVars, descriptor.position)
    } else if (this.hasToVars(descriptor)) {
      const toVars = this.getToVars(descriptor)
      this.timeline.to(target, toVars, descriptor.position)
    } else {
      Logger.log(1, "No animation property has been set.")
    }

    if (descriptor.label) {
      this.timeline.add(descriptor.label)
    }

    return this
  }

  public create(): TimelineMax {
    return this.timeline
  }

  private getFromVars(descriptor: AnimationDescriptor, hasToVars?: boolean): gsap.TweenVars {
    const vars: gsap.TweenVars = hasToVars ? {} : this.getTweenVars(descriptor)

    if (descriptor.from.alpha) {
      vars.autoAlpha = descriptor.from.alpha
    }

    if (descriptor.from.x) {
      vars.x = descriptor.from.x
    }

    if (descriptor.from.y) {
      vars.y = descriptor.from.y
    }

    if (descriptor.from.xPercent) {
      vars.xPercent = descriptor.from.xPercent
    }

    if (descriptor.from.yPercent) {
      vars.yPercent = descriptor.from.yPercent
    }

    if (descriptor.from.scale) {
      vars.scale = descriptor.from.scale
    }

    if (descriptor.from.rotation) {
      vars.rotation = descriptor.from.rotation
    }

    if (descriptor.from.width) {
      vars.width = descriptor.from.width
    }

    return vars
  }

  private getToVars(descriptor: AnimationDescriptor): gsap.TweenVars {
    const vars: gsap.TweenVars = this.getTweenVars(descriptor)

    if (descriptor.to.alpha) {
      vars.autoAlpha = descriptor.to.alpha
    }

    if (descriptor.to.x) {
      vars.x = descriptor.to.x
    }

    if (descriptor.to.y) {
      vars.y = descriptor.to.y
    }

    if (descriptor.to.xPercent) {
      vars.xPercent = descriptor.to.xPercent
    }

    if (descriptor.to.yPercent) {
      vars.yPercent = descriptor.to.yPercent
    }

    if (descriptor.to.scale) {
      vars.scale = descriptor.to.scale
    }

    if (descriptor.to.rotation) {
      vars.rotation = descriptor.to.rotation
    }

    if (descriptor.to.width) {
      vars.width = descriptor.to.width
    }

    return vars
  }

  private hasFromVars(descriptor: AnimationDescriptor): boolean {
    return Object.keys(descriptor.from).length > 0
  }

  private hasToVars(descriptor: AnimationDescriptor): boolean {
    return Object.keys(descriptor.to).length > 0
  }

  private getTweenVars(descriptor: AnimationDescriptor): gsap.TweenVars {
    const vars: gsap.TweenVars = {}

    vars.duration = descriptor.duration
    vars.repeat = descriptor.repeat
    vars.yoyo = descriptor.yoyo

    if (descriptor.momentum > 0) {
      vars.data = {
        ease: descriptor.ease,
        momentum: descriptor.momentum,
      }
    } else {
      vars.ease = descriptor.ease
    }

    return vars
  }
}
