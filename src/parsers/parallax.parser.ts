import ParallaxBuilder from "../builders/parallax.builder"
import ParamHelper from "../helpers/param.helper"

export default class ParallaxParser implements IParser<ParallaxDescriptor> {
  private breakpoints: Breakpoints
  private key: string

  constructor(breakpoints: Breakpoints) {
    this.breakpoints = breakpoints
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
    const builder = new ParallaxBuilder(this.get(el, "name"))
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

  /**
   * Gets all elements of [data-parallax] inside the container, casting nodes to @HTMLElement
   *
   * @param {HTMLElement} - Container
   *
   * @returns {HTMLElement[]} - List of [data-parallax] elements
   */
  public getElements(container: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = []

    const nodes = container.querySelectorAll(`[data-${this.key}]`)
    nodes.forEach((node) => elements.push(<HTMLElement>node))

    return elements
  }

  private get(el: HTMLElement, property: string): ParamString {
    return ParamHelper.get(el, this.breakpoints, this.key, property)
  }
}
