import { Component } from "./component"

export default class App {
  public static init<T extends { new (...args: any[]): Component }>(components: (T)[]): void {
    document.querySelectorAll("[data-component]").forEach((node) => {
      const element = <HTMLElement>node
      let name = element.getAttribute("data-component")
      let component = components.find(c => Component.getName(c) === name)
      if (!component) {
        throw new Error(`[App] Component "${name}" is not defined`)
      } else {
        if (!Component.isLoaded(element)) {
          let options
          try {
            options = eval('(' + element.getAttribute('data-component-options') + ')') || {}
          } catch (ex) {
            options = {}
          }
          let Constructor = component
          let instance = new Constructor(element, options)
          Component.load(element, instance)
          console.debug(`[App] Component "${name}" loaded.`)
        } else {
          console.debug(`[App] Component "${name}" already loaded`)
        }
      }
    })
  }
}
