import Scrollbar from 'smooth-scrollbar';
import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'gsap/ScrollToPlugin';

import ScrollScene from './scroll-scene';


/**
 * ScrollController
 * 
 * This is a wrapper for ScrollMagic controller class. It adds a smooth scrolling option and
 * some util methods.
 * 
 * @param {*} options
 */
class ScrollController {
  constructor(options) {
    this.element = options.container || window;
    this.options = options;

    this._scenes = [];
    this._scrollbarListeners = [];

    if (this.options.smoothScrolling) {
      this.initSmoothScrolling();
    } else {
      this.initCommonScrolling();
    }

    // Scroll to when loading page with hashtag
    // https://github.com/idiotWu/smooth-scrollbar/issues/128#issuecomment-390980479
    const hash = location.hash;
    if (hash) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.element.scrollTo(0, 0);
          if (this.hasSmoothScrolling()) {
            this._scrollbar.scrollIntoView(document.querySelector(hash), {
              offsetTop: -this._scrollbar.containerEl.scrollTop
            });
          } else {
            this.controller.scrollTo(hash);
          }
        }, 0);
      });
    }
  }

  initCommonScrolling() {
    this._removeAllScenes();
    this._destroyController();

    this._smoothScrolling = false;

    delete this.options.smoothScrolling;

    this.controller = new ScrollMagic.Controller(this.options);

    this.controller.scrollTo(function (newPos) {
      TweenMax.to(this, 2, {
        scrollTo: {
          y: newPos
        },
        ease: Power4.easeOut
      });
    });

    this._removeScrollbars();
    this._addAllScenes();

    console.debug('[Controller] Created common scrolling');
  }

  initSmoothScrolling() {
    this._removeAllScenes();
    this._destroyController();

    this._smoothScrolling = true;

    delete this.options.smoothScrolling;

    this.controller = new ScrollMagic.Controller(Object.assign(this.options, { refreshInterval: 0 }));
  
    this._createScrollbars();
    this._addAllScenes();

    console.debug('[Controller] Created smooth scrolling');
  }

  bindAnchors(anchors) {
    anchors.forEach(anchor => {
      // Bind scroll to anchor
      anchor.addEventListener('click', e => {
        const id = e.currentTarget.getAttribute('href');
        if (id.length > 0) {
          e.preventDefault();

          if (this.hasSmoothScrolling()) {
            const element = this.element.querySelector(id);
            if (element) {
              this._scrollbar.scrollIntoView(element);
            }
          } else {
            this.controller.scrollTo(id);
          }
        }
      });
      // Bind anchor to scroll
      const id = anchor.getAttribute('href');
      const section = this.element.querySelector(id);
      this.addScene(
        new ScrollScene({
          triggerElement: section,
          triggerHook: 'onLeave',
          duration: section.offsetHeight
        })
        .on('enter', () => anchor.classList.add('is-active'))
        .on('leave', () => anchor.classList.remove('is-active'))
      );
    });
  }

  addScene(scene) {
    scene.addTo(this);
    this._scenes.push(scene);
  }

  removeScene(scene) {
    scene.remove();

    this._scenes = this._scenes.filter(function (current) {
      return current !== scene;
    });
  }

  addScrollbarListener(listener) {
    if (this._scrollbar) {
      this._scrollbar.addListener(listener);

      this._scrollbarListeners.push(listener);
    }
  }

  removeScrollbarListener(listener) {
    if (this._scrollbar) {
      this._scrollbar.removeListener(listener);

      this._scrollbarListeners = this._scrollbarListeners.filter(function (current) {
        return current !== listener;
      });
    }
  }

  getScrollPos() {
    if (this.hasSmoothScrolling()) {
      return this._scrollbar.offset.y;
    }
    return this.controller.scrollPos();
  }

  hasSmoothScrolling() {
    return this._smoothScrolling;
  }

  _createScrollbars() {
    this._scrollbar = Scrollbar.init(this.element, {
      damping: 0.05
    });

    this.addScrollbarListener(() => this._scenes.forEach(scene => scene.refresh()));
  }

  _removeScrollbars() {
    if (this._scrollbar) {
      this._scrollbarListeners.forEach(listener => this._scrollbar.removeListener(listener));
      this._scrollbarListeners = [];
      this._scrollbar.destroy();
    }
  }

  _addAllScenes() {
    this._scenes.forEach(scene => scene.addTo(this));
  }

  _removeAllScenes() {
    this._scenes.forEach(scene => scene.remove());
  }

  _destroyController() {
    if (this.controller) {
      if (this.hasSmoothScrolling()) {
        console.debug('[Controller] Removed smooth scrolling');
      } else {
        console.debug('[Controller] Removed common scrolling');
      }
      this.controller.destroy(true);
    }
  }
};

export default ScrollController;
