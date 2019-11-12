import { component } from '../decorators';

import ScrollView from '../scroll/scroll-view';
import breakpoints from '../../breakpoints';


@component('scrollContainer')
class ScrollContainer {
  constructor(element) {
    this.view = new ScrollView({
      container: element,
      smoothScrolling: false,
      breakpoints: breakpoints
    });

    const sidebar = document.querySelector('.scene__sidebar');
    this.view.registerSceneModifier('pin-content',
      function (domScene) {
        return {
          duration: sidebar.offsetHeight - domScene.offsetHeight,
          onEnter: function () {
            this.duration(sidebar.offsetHeight - domScene.offsetHeight);
          },
          pin: domScene
        }
      });

    this.view.registerSceneModifier('slide-in-sidebar',
      function (domScene) {
        return {
          tween: TweenMax.from(domScene, 1, {
            xPercent: 100
          })
        }
      });

    // this.view.addScrollListener(e => {
    //   console.log('progress', e.progress);
    // });
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
