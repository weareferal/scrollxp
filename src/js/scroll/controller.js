import Scrollbar from 'smooth-scrollbar';
import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'gsap/ScrollToPlugin';

import Scene from './scene';


class Controller {
  constructor(options) {
    this.element = options.container || window;
    this.options = options;

    this.scenes = [];

    if (this.options.smoothScrolling) {
      this.initSmoothScrolling();
    } else {
      this.initCommonScrolling();
    }
  }

  initCommonScrolling() {
    console.log('[Controller] Removed smooth scrolling');

    this.smoothScrolling = false;

    this._removeAllScenes();
    this._destroyController();

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
  }

  initSmoothScrolling() {
    console.log('[Controller] Added smooth scrolling');

    this.smoothScrolling = true;

    this._removeAllScenes();
    this._destroyController();

    delete this.options.smoothScrolling;

    this.controller = new ScrollMagic.Controller(Object.assign(this.options, { refreshInterval: 0 }));
  
    this._createScrollbars();
    this._addAllScenes();
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
              this.scrollbar.scrollIntoView(element);
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
        new Scene({
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

    this.scenes.push(scene);
  }

  removeScene(scene) {
    scene.remove();

    this.scenes = this.scenes.filter(function (current) {
      return current !== scene;
    });
  }

  hasSmoothScrolling() {
    return this.smoothScrolling;
  }

  _createScrollbars() {
    this.scrollbar = Scrollbar.init(this.element, {
      damping: 0.05
    });

    this.scrollbar.addListener(this._refreshScenes.bind(this));
  }

  _removeScrollbars() {
    if (this.scrollbar) {
      this.scrollbar.removeListener(this._refreshScenes.bind(this));
      this.scrollbar.destroy();
    }
  }

  _addAllScenes() {
    this.scenes.forEach(scene => scene.addTo(this));
  }

  _removeAllScenes() {
    this.scenes.forEach(scene => scene.remove());
  }

  _refreshScenes() {
    this.scenes.forEach(scene => scene.refresh());
  }

  _destroyController() {
    if (this.controller) {
      this.controller.destroy(true);
    }
  }
};

export default Controller;
