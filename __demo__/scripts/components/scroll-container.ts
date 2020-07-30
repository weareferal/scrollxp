import * as breakpoints from '../breakpoints.json'
import ScrollXP from 'scrollxp'
import Component from "../component"


class ScrollContainer extends Component  {
  public static componentName = "scrollContainer"

  private view: ScrollXP

  constructor(element, options?) {
    super(element, options)

    this.view = new ScrollXP({
      container: element,
      smoothScrolling: false,
      breakpoints: breakpoints
    })
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
};

export default ScrollContainer
