import { component } from '../decorators';

import ScrollView from '../scroll/scroll-view';
import breakpoints from '../../breakpoints';


@component('scrollContainer')
class ScrollContainer {
  constructor(element) {
    this.view = new ScrollView(element, breakpoints);
  }

  bindAnchors(anchors) {
    this.view.bindAnchors(anchors);
  }

  smoothScrolling(newSmoothScrolling) {
    if (!arguments.length) {
      return this.view.smoothScrolling();
    } else {
      this.view.smoothScrolling(newSmoothScrolling);
    }
  }
};

export default ScrollContainer;
