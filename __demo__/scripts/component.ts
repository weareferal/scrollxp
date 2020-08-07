import "reflect-metadata"

const nameKey = Symbol("component")

// Based on utils from https://blog.garstasio.com/you-dont-need-jquery/utils/
const data = window.WeakMap ? new WeakMap() : (function () {
  let lastId = 0,
      store = {};

  return {
      set: function (element, info) {
          let id;
          if (element.myCustomDataTag === undefined) {
              id = lastId++;
              element.myCustomDataTag = id
          }
          store[id] = info
      },
      get: function (element) {
        return store[element.myCustomDataTag]
      }
  };
}())

/**
 * To perserve class name through mangling.
 *
 * @example
 * @component("customer")
 * class Customer {}
 * @param className
 */
export function component(className: string): ClassDecorator {
  return (Reflect as any).metadata(nameKey, className)
}

export class Component {
  public name: string
  protected element: HTMLElement
  protected options: any

  constructor(element: HTMLElement, options?: any) {
    this.element = element
    this.options = options
  }

  public static find(className: Function): Component {
    const obj = data.get(document.querySelector(`[data-component="${Component.getName(className)}"]`))
    if (!obj) {
      throw Error(`[Component] Couldn\'t find instance of ${Component.getName(className)} component. Check declaration order.`)
    }
    return obj.component
  }

  /**
   * @example
   * const type = Customer;
   * getName(type); // 'Customer'
   * @param type
   */
  public static getName(type: Function): string {
    return (Reflect as any).getMetadata(nameKey, type)
  }

  public static getInstance(element: HTMLElement): Component {
    return data.get(element).component
  }

  /**
   * @example
   * const instance = new Customer();
   * getInstanceName(instance); // 'Customer'
   * @param instance
   */
  public static getInstanceName(instance: Object): string {
    return (Reflect as any).getMetadata(nameKey, instance.constructor)
  }

  public static isLoaded(element: HTMLElement): boolean {
    return data.get(element) && data.get(element).component !== undefined
  }

  public static load(element: HTMLElement, component: Component): void {
    data.set(element, { component: component })
  }
}
