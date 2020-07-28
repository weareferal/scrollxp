import { Breakpoints } from "./breakpoints"

/**
 * PropertyHelper
 *
 * Retrieve property values from data-* attributes according to the screen width.
 *
 * @param {Breakpoints} breakpoints
 */
export default class PropertyHelper {
  public breakpoints: Breakpoints

  constructor(breakpoints?: Breakpoints) {
    this.breakpoints = breakpoints || {
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1600,
    }
  }

  public getParallaxProperty(item: HTMLElement, property: string): string | undefined {
    return this.getDataProperty("parallax", item, property)
  }

  public getSceneProperty(item: HTMLElement, property: string): string | undefined {
    return this.getDataProperty("scene", item, property)
  }

  public getAnimationProperty(item: HTMLElement, property: string): string | undefined {
    return this.getDataProperty("animate", item, property)
  }

  // TODO: Improve this to be independent from breakpoints, maybe using a recursive function
  private getDataProperty(type: string, item: HTMLElement, property: string): string | undefined {
    const screenWidth = window.innerWidth

    const key = property === type ? type : `${type}-${property}`

    // xs
    if (this.breakpoints.sm && screenWidth < this.breakpoints.sm) {
      return item.getAttribute(`data-xs-${key}`) || item.getAttribute(`data-${key}`) || undefined
    }
    // sm
    else if (this.breakpoints.md && screenWidth < this.breakpoints.md) {
      return (
        item.getAttribute(`data-sm-${key}`) ||
        item.getAttribute(`data-xs-${key}`) ||
        item.getAttribute(`data-${key}`) ||
        undefined
      )
    }
    // md
    else if (this.breakpoints.lg && screenWidth < this.breakpoints.lg) {
      return (
        item.getAttribute(`data-md-${key}`) ||
        item.getAttribute(`data-sm-${key}`) ||
        item.getAttribute(`data-xs-${key}`) ||
        item.getAttribute(`data-${key}`) ||
        undefined
      )
    }
    // lg
    else if (this.breakpoints.xl && screenWidth < this.breakpoints.xl) {
      return (
        item.getAttribute(`data-lg-${key}`) ||
        item.getAttribute(`data-md-${key}`) ||
        item.getAttribute(`data-sm-${key}`) ||
        item.getAttribute(`data-xs-${key}`) ||
        item.getAttribute(`data-${key}`) ||
        undefined
      )
    }
    // xl
    else if (this.breakpoints.xxl && screenWidth < this.breakpoints.xxl) {
      return (
        item.getAttribute(`data-xl-${key}`) ||
        item.getAttribute(`data-lg-${key}`) ||
        item.getAttribute(`data-md-${key}`) ||
        item.getAttribute(`data-sm-${key}`) ||
        item.getAttribute(`data-xs-${key}`) ||
        item.getAttribute(`data-${key}`) ||
        undefined
      )
    }
    // xxl
    else {
      return (
        item.getAttribute(`data-xxl-${key}`) ||
        item.getAttribute(`data-xl-${key}`) ||
        item.getAttribute(`data-lg-${key}`) ||
        item.getAttribute(`data-md-${key}`) ||
        item.getAttribute(`data-sm-${key}`) ||
        item.getAttribute(`data-xs-${key}`) ||
        item.getAttribute(`data-${key}`) ||
        undefined
      )
    }
  }
}
