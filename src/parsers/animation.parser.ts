import AnimationBuilder from "../builders/animation.builder"
import ParamHelper from "../helpers/param.helper"

export default class AnimationParser implements IParser<AnimationDescriptor> {
  private breakpoints: Breakpoints
  private defaultOptions?: AnimationDescriptor
  private key: string

  constructor(breakpoints: Breakpoints, defaultOptions?: AnimationDescriptor) {
    this.breakpoints = breakpoints
    this.defaultOptions = defaultOptions
    this.key = "animate"
  }

  /**
   * Parses a [data-animate] element, transforming its [data-animate-*] attributes into an object.
   *
   * @example
   * Input:
   * <div data-animate data-animate-from-alpha="0" data-animate-to-alpha="1"></div>
   * Output:
   * {
   *   from: {
   *     alpha: 0
   *   },
   *   to: {
   *     alpha: 1
   *   }
   * }
   *
   * @param {HTMLElement} - Element with [data-animate-*] attributes
   *
   * @returns {AnimationDescriptor} - Object with the parsed information
   */
  public parse(el: HTMLElement): AnimationDescriptor {
    const builder = new AnimationBuilder(this.get(el, "name"), this.defaultOptions)
    builder.duration(this.get(el, "duration"))
    builder.position(this.get(el, "position"))
    builder.repeat(this.get(el, "repeat"))
    builder.yoyo(this.get(el, "yoyo"))
    builder.delay(this.get(el, "delay"))
    builder.momentum(this.get(el, "momentum"))
    builder.stagger(this.get(el, "stagger"))
    builder.transformOrigin(this.get(el, "transformOrigin"))
    builder.ease(this.get(el, "ease"))
    builder.label(this.get(el, "label"))
    builder.fromAlpha(this.get(el, "from-alpha"))
    builder.toAlpha(this.get(el, "to-alpha"))
    builder.fromX(this.get(el, "from-x"))
    builder.toX(this.get(el, "to-x"))
    builder.fromY(this.get(el, "from-y"))
    builder.toY(this.get(el, "to-y"))
    builder.fromXPercent(this.get(el, "from-x-percent"))
    builder.toXPercent(this.get(el, "to-x-percent"))
    builder.fromYPercent(this.get(el, "from-y-percent"))
    builder.toYPercent(this.get(el, "to-y-percent"))
    builder.fromScale(this.get(el, "from-scale"))
    builder.toScale(this.get(el, "to-scale"))
    builder.fromRotation(this.get(el, "from-rotation"))
    builder.toRotation(this.get(el, "to-rotation"))
    builder.fromWidth(this.get(el, "from-width"))
    builder.toWidth(this.get(el, "to-width"))
    return builder.build()
  }

  /**
   * Gets all elements of [data-animate] inside the container, casting nodes to @HTMLElement
   *
   * @param {HTMLElement} - Container
   *
   * @returns {HTMLElement[]} - List of [data-animate] elements
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
