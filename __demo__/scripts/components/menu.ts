import ScrollContainer from "./scroll-container"
import { Component, component } from "../component"

@component("menu")
class Menu extends Component {
  constructor(element, options?) {
    super(element, options)

    const scrollContainer = Component.find(ScrollContainer)
    if (scrollContainer) {
      const anchors = element.querySelectorAll('a[href^="#"]')
      scrollContainer.bindAnchors(anchors)
    }
  }
};

export default Menu
