import { Component } from "./component"

import Menu from "./components/menu"
import ScrollContainer from "./components/scroll-container"
import ToggleButton from "./components/toggle-button"

type InterfaceComponent = (typeof Menu | typeof ScrollContainer | typeof ToggleButton)

class App {
  public static init(components: (InterfaceComponent)[]): void {
    document.querySelectorAll("[data-component]").forEach((node) => {
      const element = <HTMLElement>node
      let name = element.getAttribute("data-component")
      let component = components.find(c => Component.getName(c) === name)
      if (!component) {
        throw Error(`[App] Component "${name}" is not defined`)
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

(() => {
  App.init([
    Menu,
    ScrollContainer,
    ToggleButton
  ])
})()
