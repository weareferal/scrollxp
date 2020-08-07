import "reflect-metadata"

const nameKey = Symbol("component")

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
 * To perserve class name through mangling.
 *
 * @example
 * @component("foo")
 * class Foo {}
 *
 * @param className
 */
export function component(className: string): ClassDecorator {
  return Reflect.metadata(nameKey, className)
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
    const obj = data.get(document.querySelector(`[data-component="${Component.getName(className)}"]`))
    if (!obj) {
      throw Error(`[Component] Couldn\'t find instance of ${Component.getName(className)} component. Check declaration order.`)
    }
    return obj.component
  }

  /**
   * Get the component name set in the decorator.
   *
   * @example
   * const type = Foo;
   * getName(type); // 'Foo'
   * @param type
   */
  public static getName<T extends { new (...args: any[]): Component }>(type: T): string {
    return Reflect.getMetadata(nameKey, type)
  }

  /**
   * Get instance of the component bound to the element.
   *
   * @param element
   *
   * @returns Component
   */
  public static getInstance<T extends { new (...args: any[]): Component }>(element: HTMLElement): InstanceType<T> {
    return data.get(element).component
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
