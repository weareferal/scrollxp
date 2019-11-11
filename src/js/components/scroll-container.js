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

  toggleSmoothScrolling() {
    return this.view.toggleSmoothScrolling();
  }

  hasSmoothScrolling() {
    return this.view.hasSmoothScrolling();
  }
};

export default ScrollContainer;
