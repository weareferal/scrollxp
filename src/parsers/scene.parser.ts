import SceneBuilder from "../builders/scene.builder"
import ParamHelper from "../helpers/param.helper"

export default class SceneParser implements IParser<SceneDescriptor> {
  private breakpoints: Breakpoints
  private defaultOptions?: SceneDescriptor
  private key: string

  constructor(breakpoints: Breakpoints, defaultOptions?: SceneDescriptor) {
    this.breakpoints = breakpoints
    this.defaultOptions = defaultOptions
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

  /**
   * Gets the name of the descriptor.
   *
   * @param {HTMLElement} - Element that has or hasn't the name
   *
   * @returns {string | undefined} - The name if it exists
   */
  public getName(el: HTMLElement): string | undefined {
    return this.get(el, "name")
  }

  /**
   * Gets all elements of [data-scene] inside the container, casting nodes to @HTMLElement
   *
   * @param {HTMLElement} - Container
   *
   * @returns {HTMLElement[]} - List of [data-scene] elements
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
