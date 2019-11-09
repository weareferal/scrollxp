import { component } from '../decorators';

import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';


import Controller from '../scroll/controller';
import Scene from '../scroll/scene';


@component('scrollController')
class ScrollController {
  constructor(element) {
    this.controller = new Controller({
      container: element,
      smoothScrolling: false,
      addIndicators: true
    });

    this.controller.addScene(
      new Scene({
        triggerElement: '#section1',
        duration: '100%'
      })
      .setTween('.square', {
        x: 200
      })
    );
  }

  bindAnchors(anchors) {
    this.controller.bindAnchors(anchors);
  }

  toggleSmoothScrolling() {
    if (this.controller.hasSmoothScrolling()) {
      this.controller.initCommonScrolling();
    } else {
      this.controller.initSmoothScrolling();
    }
  }

  hasSmoothScrolling() {
    return this.controller.hasSmoothScrolling();
  }
};

export default ScrollController;
