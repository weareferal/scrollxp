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

  toggleSmoothScrolling() {
    if (this.controller.hasSmoothScrolling()) {
      this.controller.removeSmoothScrolling();
      return false;
    } else {
      this.controller.addSmoothScrolling();
      return true;
    }
  }
};

export default ScrollController;
