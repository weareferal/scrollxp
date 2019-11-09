import { component } from '../decorators';

import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';


import Controller from '../scroll/controller';
import Scene from '../scroll/scene';
import { BreakpointListener } from '../utils';
import breakpoints from '../../breakpoints';


@component('scrollController')
class ScrollController {
  constructor(element) {
    this.smoothScrolling = false;

    this.controller = new Controller({
      container: element,
      smoothScrolling: this.smoothScrolling,
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

    // Disable smooth scrolling on mobile
    new BreakpointListener(({ screenSize, hasChanged }) => {
      if (hasChanged && this.smoothScrolling) {
        if (screenSize === 'xs') {
          this.controller.initCommonScrolling();
        } else {
          this.controller.initSmoothScrolling();
        }
      }
    }, breakpoints);
  }

  bindAnchors(anchors) {
    this.controller.bindAnchors(anchors);
  }

  toggleSmoothScrolling() {
    if (this.controller.hasSmoothScrolling()) {
      this.controller.initCommonScrolling();
      this.smoothScrolling = false;
    } else {
      this.controller.initSmoothScrolling();
      this.smoothScrolling = true;
    }
  }

  hasSmoothScrolling() {
    return this.controller.hasSmoothScrolling();
  }
};

export default ScrollController;
