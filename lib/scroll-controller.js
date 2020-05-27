import Scrollbar from 'smooth-scrollbar';
import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'gsap/ScrollToPlugin';


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
    this._container = options.container;
    this._options = options;

    // These lists keep scenes and scrollbar listeners, so that when we turn on/off the smooth scrolling,
    // they are removed/added to the new controller.
    this._scenes = [];
    this._scrollbarListeners = [];

    this.smoothScrolling(this._options.smoothScrolling);

    // Scroll to when loading page with hashtag
    // https://github.com/idiotWu/smooth-scrollbar/issues/128#issuecomment-390980479
    const hash = location.hash;
    if (hash) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this._container.scrollTo(0, 0);
          if (this.smoothScrolling()) {
            this._scrollbar.scrollIntoView(document.querySelector(hash), {
              offsetTop: -this._scrollbar.containerEl.scrollTop
            });
          } else {
            this._controller.scrollTo(hash);
          }
        }, 0);
      });
    }
  }

  controller() {
    return this._controller;
  }

  smoothScrolling(newSmoothScrolling) {
    if (!arguments.length) {
      return this._smoothScrolling;
    } else {
      this._removeAllScenes();
      this._destroyController();

      this._smoothScrolling = newSmoothScrolling;

      delete this._options.smoothScrolling;

      const scrollOffset = this._options.scrollOffset;
      delete this._options.scrollOffset;

      if (newSmoothScrolling) {
        console.debug('[ScrollController] Smooth scrolling activated');

        this._controller = new ScrollMagic.Controller(Object.assign(this._options, { refreshInterval: 0 }));

        this._createScrollbars();
      } else {
        console.debug('[ScrollController] Common scrolling activated');

        this._controller = new ScrollMagic.Controller(this._options);

        this._controller.scrollTo(function (newPos, callback) {
          TweenMax.to(this, 2, {
            scrollTo: {
              y: newPos + scrollOffset
            },
            onComplete: function () {
              if (callback) callback();
            },
            ease: Power4.easeOut
          });
        });

        this._removeScrollbars();
      }

      this._addAllScenes();
    }
  }

  scrollTo(targetId) {
    if (this.smoothScrolling()) {
      const element = this._container.querySelector(targetId);
      if (element) {
        this._scrollbar.scrollIntoView(element);
      }
    } else {
      this._latestTargetId = targetId;

      this._isScrollingTo = true;
      this._controller.scrollTo(targetId, () => {
        this._isScrollingTo = false;
      });
    }
  }

  getScrollPos() {
    if (this.smoothScrolling()) {
      return this._scrollbar.offset.y;
    }
    return this._controller.scrollPos();
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

  setScrollOffset(offset) {
    if(!this._smoothScrolling) {
      this._controller.scrollTo(function (newPos, callback) {
        TweenMax.to(this, 2, {
          scrollTo: {
            y: newPos + offset
          },
          onComplete: function () {
            if (callback) callback();
          },
          ease: Power4.easeOut
        });
      });

      // This is necessary because if the offset changes while the page is animating,
      // it goes to the wrong position. So we need to animate it to the right one.
      if (this._isScrollingTo && this._latestTargetId) {
        this.scrollTo(this._latestTargetId);
        this._latestTargetId = null;
      }
    }
  }

  _createScrollbars() {
    this._scrollbar = Scrollbar.init(this._container, {
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
    if (this._controller) {
      if (this.smoothScrolling()) {
        console.debug('[Controller] Removed smooth scrolling');
      } else {
        console.debug('[Controller] Removed common scrolling');
      }
      this._controller.destroy(true);
    }
  }
};

export default ScrollController;
