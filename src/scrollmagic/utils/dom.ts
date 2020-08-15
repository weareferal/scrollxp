import type from "./type"

export enum OffsetParam {
  Left = "left",
  Top = "top",
}

export interface Offset {
  top: number
  left: number
}

export interface CSSProperty {
  [key: string]: string | number | undefined
}

// Parse float and fall back to 0.
function floatval(number: string): number {
  return parseFloat(number) || 0
}

// Get current style IE safe (otherwise IE would return calculated values for 'auto')
function getComputedStyle(elem: HTMLElement): CSSStyleDeclaration {
  return elem["currentStyle"] ? elem["currentStyle"] : window.getComputedStyle(elem)
}

// Get element dimension (width or height)
function dimension(
  which: string,
  elem: HTMLElement | Document | Window,
  outer?: boolean,
  includeMargin?: boolean,
): number {
  const e = elem instanceof Document ? window : elem

  if (e instanceof Window) {
    includeMargin = false
  } else if (!type.isDomElement(e)) {
    return 0
  }

  which = which.charAt(0).toUpperCase() + which.substr(1).toLowerCase()

  let dimension = (outer ? e["offset" + which] || e["outer" + which] : e["client" + which] || e["inner" + which]) || 0

  if (type.isDomElement(e) && outer && includeMargin) {
    const style: CSSStyleDeclaration = getComputedStyle(<HTMLElement>e)
    dimension +=
      which === "Height"
        ? floatval(style.marginTop) + floatval(style.marginBottom)
        : floatval(style.marginLeft) + floatval(style.marginRight)
  }

  return dimension
}

// Converts 'margin-top' into 'marginTop'
function camelCase(str: string): string {
  return str.replace(/^[^a-z]+([a-z])/g, "$1").replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase()
  })
}

export default {
  getContainer(selector: string | Node | Window): HTMLElement | Window | Document {
    if (selector instanceof Window || selector instanceof Document) {
      return selector
    } else {
      return <HTMLElement>this.getElements(selector)[0]
    }
  },
  // FIXME: This is not entirely translated because it doesn't consider a selector with Window nor Document types, hopefully it won't need it
  // Always returns a list of matching DOM elements, from a selector, a DOM element or an list of elements or even an array of selectors
  getElements(selector: string | Node | Node[]): Array<Node | Node[]> {
    let arr: Array<Node | Node[]> = []

    // String selector
    if (type.isString(selector)) {
      try {
        selector = <Node[]>Array.from(document.querySelectorAll(<string>selector))
      } catch (e) {
        return <Node[]>arr // Invalid selector
      }
    }

    // List of elements
    if (type.isArray(selector)) {
      for (let i = 0, ref = (arr.length = (<Node[]>selector).length); i < ref; i++) {
        arr[i] = type.isDomElement(selector[i]) ? selector[i] : this.getElements(selector[i]) // If not an element, try to resolve recursively
      }
    } else if (type.isDomElement(selector)) {
      arr = [<Node>selector] // Only the element
    }

    return arr
  },
  // Get scroll top value
  getScrollTop(elem?: HTMLElement | Window): number {
    return elem && elem instanceof HTMLElement ? elem.scrollTop : window.pageYOffset || 0
  },
  // Get scroll left value
  getScrollLeft(elem?: HTMLElement | Window): number {
    return elem && elem instanceof HTMLElement ? elem.scrollLeft : window.pageXOffset || 0
  },
  // Get element width
  getWidth(elem: HTMLElement | Document | Window, outer?: boolean, includeMargin?: boolean): number {
    return dimension("width", elem, outer, includeMargin)
  },
  // Get element height
  getHeight(elem: HTMLElement | Document | Window, outer?: boolean, includeMargin?: boolean): number {
    return dimension("height", elem, outer, includeMargin)
  },
  // Get element position (optionally relative to viewport)
  getOffset(elem: HTMLElement | Window, relativeToViewport?: boolean): Offset {
    const offset: Offset = { top: 0, left: 0 }

    if (elem && elem instanceof HTMLElement && elem.getBoundingClientRect) {
      // Check if available
      const rect = elem.getBoundingClientRect()
      offset.top = rect.top
      offset.left = rect.left

      if (!relativeToViewport) {
        // clientRect is by default relative to viewport...
        offset.top += this.getScrollTop()
        offset.left += this.getScrollLeft()
      }
    }

    return offset
  },
  addClass(elem?: HTMLElement, classes?: string[]): void {
    if (!elem) {
      throw new Error("[DomUtils] No element passed to add class")
    }
    if (classes) {
      if (elem.classList) {
        elem.classList.add(...classes)
      } else {
        classes.forEach((classname) => {
          elem.className += " " + classname
        })
      }
    }
  },
  removeClass(elem?: HTMLElement, classes?: string[]): void {
    if (!elem) {
      throw new Error("[DomUtils] No element passed to remove class")
    }
    if (classes) {
      if (elem.classList) {
        elem.classList.remove(...classes)
      } else {
        classes.forEach((classname) => {
          elem.className = elem.className.replace(
            new RegExp("(^|\\b)" + classname.split(" ").join("|") + "(\\b|$)", "gi"),
            " ",
          )
        })
      }
    }
  },
  // If options is string -> returns css value
  // If options is array -> returns object with css value pairs
  // If options is object -> set new css values
  css(elem?: HTMLElement, options?: string | Array<string> | CSSProperty): string | number | CSSProperty | void {
    if (elem && options) {
      elem = <HTMLElement>elem

      // String options
      if (type.isString(options)) {
        const property = <string>options
        return getComputedStyle(elem)[camelCase(property)]
      }
      // List of options
      else if (type.isArray(options)) {
        const obj: { [propName: string]: string | number } = {}
        const style: CSSStyleDeclaration = getComputedStyle(elem)

        const properties = <Array<string>>options
        properties.forEach(function (property) {
          obj[property] = style[camelCase(property)]
        })

        return obj
      }
      // Object with options
      else {
        const properties = <CSSProperty>options
        for (const property in properties) {
          let val = properties[property]
          if (val == parseFloat(<string>val)) {
            val += "px" // Assume pixel for seemingly numerical values
          }
          elem.style[camelCase(property)] = val
        }
      }
    }
  },
  extend(...args: CSSProperty[]): CSSProperty {
    if (args.length > 0) {
      const obj = args[0]
      for (let i = 1; i < args.length; i++) {
        if (!args[i]) {
          continue
        }
        for (const key in args[i]) {
          if (args[i].hasOwnProperty(key)) {
            obj[key] = args[i][key]
          }
        }
      }
      return obj
    }
    return {}
  },
  // Check if a css display type results in margin-collapse or not
  isMarginCollapseType(str: string): boolean {
    return ["block", "flex", "list-item", "table", "-webkit-box"].indexOf(str) > -1
  },
}
