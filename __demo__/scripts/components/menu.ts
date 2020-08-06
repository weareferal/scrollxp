import { findComponent } from '../utils'
import ScrollContainer from './scroll-container'
import Component from "../component"

class Menu extends Component {
  public static componentName = "menu"

  constructor(element, options?) {
    super(element, options)

    const scrollContainer = findComponent(ScrollContainer)
    if (scrollContainer) {
      const anchors = element.querySelectorAll('a[href^="#"]')
      scrollContainer.bindAnchors(anchors)
    }
  }
};

export default Menu
