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
      smoothScrolling: false,
      breakpoints: breakpoints
    })

    this.view.setDefault(new ScrollXP.Animation().fromAlpha(0).toAlpha(1).build())

    // const sidebar = <HTMLElement>document.querySelector(".scene__sidebar")
    // if (sidebar) {
    //   this.view.registerSceneModifier("pin-content",
    //     (domScene) => {
    //       return {
    //         duration: sidebar.offsetHeight - domScene.offsetHeight,
    //         onEnter(scene: ScrollScene) {
    //           scene.duration(sidebar.offsetHeight - domScene.offsetHeight)
    //         },
    //         pin: domScene
    //       }
    //     })
    // }

    // this.view.registerSceneModifier("slide-in-sidebar",
    //   (domScene) => {
    //     return {
    //       tween: gsap.from(domScene, {
    //         duration: 1,
    //         xPercent: 100
    //       })
    //     }
    //   })
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
