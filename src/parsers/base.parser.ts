import ParamHelper from "../helpers/param.helper"
import { Breakpoints, Descriptor, ParamString, IParser } from "../interfaces"

export default abstract class BaseParser<D extends Descriptor> implements IParser<D> {
  protected breakpoints: Breakpoints
  protected defaultOptions?: D
  protected key: string

  constructor(breakpoints: Breakpoints, defaultOptions?: D) {
    this.breakpoints = breakpoints
    this.defaultOptions = defaultOptions
  }

  /**
   * Parses a [data-key] element, transforming its [data-key-*] attributes into an object.
   *
   * @param {HTMLElement} - Element with [data-key-*] attributes
   *
   * @returns {Descriptor} - Object with the parsed information
   */
  abstract parse(el: HTMLElement): D

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
   * Gets all elements of [data-key] inside the container, casting nodes to @HTMLElement
   *
   * @param {HTMLElement} - Container
   *
   * @returns {HTMLElement[]} - List of [data-key] elements
   */
  public getElements(container: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = []

    const nodes = container.querySelectorAll(`[data-${this.key}]`)
    nodes.forEach((node) => elements.push(<HTMLElement>node))

    return elements
  }

  protected get(el: HTMLElement, property: string): ParamString {
    return ParamHelper.get(el, this.breakpoints, this.key, property)
  }
}
