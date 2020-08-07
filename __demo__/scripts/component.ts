import "reflect-metadata"

const nameKey = Symbol("dataComponent")

/**
 * Map the DOM element to its component instance.
 * 
 * Based on utils from https://blog.garstasio.com/you-dont-need-jquery/utils/
 */
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
 * Decorator to set the component name which will be used on templates.
 *
 * @example
 * @DataComponent("foo")
 * class Foo {}
 *
 * @param componentName
 */
export function DataComponent(componentName: string): ClassDecorator {
  return Reflect.metadata(nameKey, componentName)
}

export class Component {
  protected element: HTMLElement
  protected options: any

  constructor(element: HTMLElement, options?: any) {
    this.element = element
    this.options = options
  }

  /**
   * Find component instance based on component class.
   * 
   * @example
   * import Foo from "./components/foo"
   * const foo = Component.find(Foo)
   *
   * @param class
   *
   * @returns Instance of class
   */
  public static find<T extends { new (...args: any[]): Component }>(className: T): InstanceType<T> {
    const elements = document.querySelectorAll(`[data-component="${Component.getName(className)}"]`)
    if (!elements.length) {
      throw Error(`[Component] Couldn\'t find element with [data-component="${Component.getName(className)}"].`)
    }
    if (elements.length > 1) {
      console.warn(`[Component] Found more than 1 element with [data-component="${Component.getName(className)}"]. Returning the first one.`)
    }
    return Component.getInstance(<HTMLElement>elements[0])
  }

  /**
   * Get instance of the component bound to the element.
   *
   * @param element
   *
   * @returns Component
   */
  public static getInstance<T extends { new (...args: any[]): Component }>(element: HTMLElement): InstanceType<T> {
    const obj = data.get(element)
    if (!obj) {
      throw Error(`[Component] Couldn\'t find instance of "${element.getAttribute("data-component")}" component. Check declaration order.`)
    }
    return obj.component
  }

  /**
   * Get the component name set in the decorator.
   *
   * @example
   * @DataComponent("foo")
   * class Foo extends Component {}
   *
   * getName(Foo) // 'foo'
   *
   * @param clazz
   *
   * @returns string
   */
  public static getName<T extends { new (...args: any[]): Component }>(clazz: T): string {
    return Reflect.getMetadata(nameKey, clazz)
  }

  /**
   * Check if component is bound to the element.
   * 
   * @params element
   * 
   * @returns boolean
   */
  public static isLoaded(element: HTMLElement): boolean {
    return data.get(element) && data.get(element).component !== undefined
  }

  /**
   * Bind component to the element.
   *
   * @param element
   * @param component
   */
  public static load<T extends Component>(element: HTMLElement, component: T): void {
    data.set(element, { component: component })
  }
}
