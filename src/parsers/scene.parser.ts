import BaseParser from "./base.parser"
import SceneBuilder from "../builders/scene.builder"
import { Breakpoints, SceneDescriptor } from "../interfaces"

export default class SceneParser extends BaseParser<SceneDescriptor> {
  constructor(breakpoints: Breakpoints, defaultOptions?: SceneDescriptor) {
    super(breakpoints, defaultOptions)
    this.key = "scene"
  }

  /**
   * Parses a [data-scene] element, transforming its [data-scene-*] attributes into an object.
   *
   * @example
   * Input:
   * <div data-scene data-scene-hook="0.5" data-scene-reverse="true"></div>
   * Output:
   * {
   *   hook: 0.5,
   *   reverse: true
   * }
   *
   * @param {HTMLElement} - Element with [data-animate-*] attributes
   *
   * @returns {SceneDescriptor} - Object with the parsed information
   */
  public parse(el: HTMLElement, container?: HTMLElement): SceneDescriptor {
    const builder = new SceneBuilder(this.get(el, "name"), this.defaultOptions)
    builder.enabled(this.get(el, "enabled"))
    builder.trigger(this.get(el, "trigger"), container)
    builder.duration(this.get(el, "duration"))
    builder.hook(this.get(el, "hook"))
    builder.reverse(this.get(el, "reverse"))
    builder.pin(this.get(el, "pin"))
    builder.classToggle(this.get(el, "class-toggle"))
    builder.indicator(this.get(el, "indicator"))
    return builder.build()
  }
}
