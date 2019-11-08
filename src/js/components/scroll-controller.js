import { component } from '../decorators';

import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'gsap/ScrollToPlugin';
import { TweenMax, Circ } from 'gsap';


@component('scrollController')
class ScrollController {
  constructor(element) {
    this.controller = new ScrollMagic.Controller({
      addIndicators: true
    });

    this.createParallax();
  }

  createParallax() {
    const parallax = document.querySelector('.parallax');
    const element1 = document.querySelector('.parallax__element-1');
    const element2 = document.querySelector('.parallax__element-2');

    let during = false;
    let start = null;

    new ScrollMagic.Scene({
      triggerElement: element2,
      triggerHook: 'onCenter'
    })
    .setTween(TweenMax.fromTo(element2, .3, {
      scale: 0
    }, {
      scale: 1,
      ease: Elastic.easeOut.config(1, 0.75)
    }))
    .addTo(this.controller);

    new ScrollMagic.Scene({
      triggerElement: parallax,
      triggerHook: 'onEnter',
      duration: parallax.offsetHeight
    })
    .on('update', (e) => {
      if (during) {
        if (!start) {
          start = e.startPos;
        }

        const delta = e.scrollPos - start;

        TweenMax.to(element1, .8, {
          y: delta/4
        });

        TweenMax.to(element2, .8, {
          y: delta/2
        });
      }
    })
    .on('enter', (e) => {
      during = true;
    })
    .on('leave', (e) => {
      during = false;
    })
    .addTo(this.controller);
  }
};

export default ScrollController;
