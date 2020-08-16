import ScrollXP from "scrollxp"

import * as breakpoints from '../breakpoints.json'
import { Component, DataComponent } from "../component"

@DataComponent("scrollContainer")
export default class ScrollContainer extends Component {
  private view: ScrollXP

  constructor(element, options?) {
    super(element, options)

    this.view = new ScrollXP({
      container: element,
      breakpoints: breakpoints
    })

    const sidebar = <HTMLElement>document.querySelector("#sidebar")
    if (sidebar) {
      this.view.register(new ScrollXP.Scene("pin-content").pin(true).onEnter((element, scene) => {
        scene.duration(sidebar.offsetHeight - element.offsetHeight)
      }).build())
    }
  }

  bindAnchors(anchors) {
    this.view.bindAnchors(anchors);
  }

  smoothScrolling(...args: boolean[]): boolean {
    if (args.length > 0) {
      this.view.smoothScrolling = args[0]
    }
    return this.view.smoothScrolling
  }
}
