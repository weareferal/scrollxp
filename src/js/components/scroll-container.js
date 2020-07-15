import { component } from '../decorators';

import ScrollView from '../../../lib/scroll-view';
import breakpoints from '../../breakpoints';
import Bla from 'scrollxp';


@component('scrollContainer')
class ScrollContainer {
  constructor(element) {
    const bla = new Bla();
    bla.showMessage();

    this.view = new ScrollView({
      container: element,
      smoothScrolling: false,
      breakpoints: breakpoints
    });
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
