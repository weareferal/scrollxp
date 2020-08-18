import BaseParser from "./base.parser"
import ParallaxBuilder from "../builders/parallax.builder"

export default class ParallaxParser extends BaseParser<ParallaxDescriptor> {
  constructor(breakpoints: Breakpoints, defaultOptions?: ParallaxDescriptor) {
    super(breakpoints, defaultOptions)
    this.key = "parallax"
  }

  /**
   * Parses a [data-parallax] element, transforming its [data-parallax-*] attributes into an object.
   *
   * @example
   * Input:
   * <div data-parallax data-parallax-speed="2" data-parallax-enabled="true"></div>
   * Output:
   * {
   *   speed: 2,
   *   enabled: true
   * }
   *
   * @param {HTMLElement} - Element with [data-parallax-*] attributes
   *
   * @returns {ParallaxDescriptor} - Object with the parsed information
   */
  public parse(el: HTMLElement, container?: HTMLElement): ParallaxDescriptor {
    const builder = new ParallaxBuilder(this.get(el, "name"), this.defaultOptions)
    builder.enabled(this.get(el, "enabled"))
    builder.type(this.get(el, "type"))
    builder.speed(this.get(el, "speed"))
    builder.momentum(this.get(el, "momentum"))
    builder.stagger(this.get(el, "stagger"))
    builder.ease(this.get(el, "ease"))
    builder.element(el)
    builder.trigger(this.get(el, "trigger"), container)
    builder.duration(this.get(el, "duration"))
    builder.hook(this.get(el, "hook"))
    builder.offset(this.get(el, "offset"))
    builder.indicator(this.get(el, "indicator"))
    return builder.build()
  }
}
