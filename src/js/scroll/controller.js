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

    this.smoothScrolling = false;

    this.scenes = [];

    this.controller = new ScrollMagic.Controller(this.options);
  }

  addSmoothScrolling() {
    console.log('[Controller] Added smooth scrolling');

    this.smoothScrolling = true;

    this.scenes.forEach(scene => scene.remove());

    this.controller.destroy(true);

    this.controller = new ScrollMagic.Controller(Object.assign(this.options, { refreshInterval: 0 }));

    this.scenes.forEach(scene => scene.addTo(this));
  
    this.scrollbar = Scrollbar.init(this.element, {
      damping: 0.05
    });

    this.scrollbar.addListener(this._refreshScenes.bind(this));
  }

  removeSmoothScrolling() {
    console.log('[Controller] Removed smooth scrolling');

    this.smoothScrolling = false;

    this.scenes.forEach(scene => scene.remove());

    this.controller.destroy(true);

    this.controller = new ScrollMagic.Controller(this.options);

    if (this.scrollbar) {
      this.scrollbar.removeListener(this._refreshScenes.bind(this));
      this.scrollbar.destroy();
    }

    this.scenes.forEach(scene => scene.addTo(this));
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

  _refreshScenes() {
    this.scenes.forEach(scene => scene.refresh());
  }
};

export default Controller;
