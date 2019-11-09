import { component } from '../decorators';

import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';


import Controller from '../scroll/controller';
import Scene from '../scroll/scene';
import { BreakpointListener } from '../utils';
import breakpoints from '../../breakpoints';
import { TweenMax } from 'gsap';


@component('scrollController')
class ScrollController {
  constructor(element) {
    this.element = element;
    this.content = this.element.children[0];

    this.smoothScrolling = false;

    this.parallaxScenes = [];

    this.controller = new Controller({
      container: this.element,
      smoothScrolling: this.smoothScrolling,
      addIndicators: false
    });

    new BreakpointListener(({ screenSize, hasChanged }) => {
      if (hasChanged) {
        // Disable smooth scrolling on mobile
        if (this.smoothScrolling) {
          if (screenSize === 'xs') {
            this.controller.initCommonScrolling();
          } else {
            this.controller.initSmoothScrolling();
          }
        }
        console.log('[ScrollController] Screen size has changed. Rebuiling scenes for:', screenSize);
        this.rebuild();
      }
    }, breakpoints);
  }

  rebuild() {
    setTimeout(() => {
      this.resetScenes();
      this.buildParallaxScenes();
    }, 0);
  }

  buildParallaxScenes() {
    const globalElements = [];
    const sceneElements = [];

    const elements = this.element.querySelectorAll('[data-parallax]');

    elements.forEach(element => {
      const isEnabled = eval(this.getParallaxProperty(element, 'enabled', true));

      if (isEnabled) {
        const speed = this.getParallaxProperty(element, 'speed', 1);
        const momentum = this.getParallaxProperty(element, 'momentum', .3);
        const ease = eval(this.getParallaxProperty(element, 'ease', 'Power0.easeNone'));

        let item = {
          element: element,
          speed: speed,
          momentum: momentum,
          ease: ease
        };

        const parallaxType = this.getParallaxProperty(element, 'parallax', 'global');

        // Global items
        if (parallaxType === 'global') {
          globalElements.push(item);
        }
        // Scene items
        else if (parallaxType === 'scene') {
          const trigger = this.getParallaxProperty(element, 'trigger', element.parentNode);
          const duration = this.getParallaxProperty(element, 'duration', '100%');
          const hook = this.getParallaxProperty(element, 'hook', 'onCenter');
          const indicator = this.getParallaxProperty(element, 'indicator', null);

          item = Object.assign(item, {
            trigger: trigger,
            duration: duration,
            hook: hook,
            indicator: indicator
          });

          sceneElements.push(item);
        }
      } else {
        TweenMax.set(element, { clearProps: 'all' });
      }
    });

    if (globalElements.length > 0) {
      this._buildGlobalParallax(globalElements);
    }

    if (sceneElements.length > 0) {
      this._buildScenesParallax(sceneElements);
    }
  }

  resetScenes() {
    this.parallaxScenes.forEach(scene => this.controller.removeScene(scene));
    this.parallaxScenes = [];
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
    console.log('[ScrollController] Scrolling has changed, rebuilding scenes.');
    this.rebuild();
  }

  hasSmoothScrolling() {
    return this.controller.hasSmoothScrolling();
  }

  getParallaxProperty(item, property, defaultValue) {
    return this.getDataProperty('parallax', item, property, defaultValue);
  }

  getAnimationProperty(item, property, defaultValue) {
    return this.getDataProperty('animate', item, property, defaultValue);
  }

  getSceneProperty(item, property, defaultValue) {
    return this.getDataProperty('scene', item, property, defaultValue);
  }

  // TODO: Improve this to be independent from breakpoints, maybe using a recursive function
  getDataProperty(type, item, property, defaultValue) {
    const screenWidth = window.innerWidth;

    let key = property === type ? type : `${type}-${property}`;

    // xs
    if (screenWidth < breakpoints['sm']) {
      return item.getAttribute(`data-xs-${key}`) ||
             item.getAttribute(`data-${key}`) ||
             defaultValue;
    }
    // sm
    else if (screenWidth < breakpoints['md']) {
      return item.getAttribute(`data-sm-${key}`) ||
             item.getAttribute(`data-xs-${key}`) ||
             item.getAttribute(`data-${key}`) ||
             defaultValue;
    }
    // md
    else if (screenWidth < breakpoints['lg']) {
      return item.getAttribute(`data-md-${key}`) ||
             item.getAttribute(`data-sm-${key}`) ||
             item.getAttribute(`data-xs-${key}`) ||
             item.getAttribute(`data-${key}`) ||
             defaultValue;
    }
    // lg
    else if (screenWidth < breakpoints['xl']) {
      return item.getAttribute(`data-lg-${key}`) ||
             item.getAttribute(`data-md-${key}`) ||
             item.getAttribute(`data-sm-${key}`) ||
             item.getAttribute(`data-xs-${key}`) ||
             item.getAttribute(`data-${key}`) ||
             defaultValue;
    }
    // xl
    else if (screenWidth < breakpoints['xxl']) {
      return item.getAttribute(`data-xl-${key}`) ||
             item.getAttribute(`data-lg-${key}`) ||
             item.getAttribute(`data-md-${key}`) ||
             item.getAttribute(`data-sm-${key}`) ||
             item.getAttribute(`data-xs-${key}`) ||
             item.getAttribute(`data-${key}`) ||
             defaultValue;
    }
    // xxl
    else {
      return item.getAttribute(`data-xxl-${key}`) ||
             item.getAttribute(`data-xl-${key}`) ||
             item.getAttribute(`data-lg-${key}`) ||
             item.getAttribute(`data-md-${key}`) ||
             item.getAttribute(`data-sm-${key}`) ||
             item.getAttribute(`data-xs-${key}`) ||
             item.getAttribute(`data-${key}`) ||
             defaultValue;
    }
  }

  _buildGlobalParallax(items) {
    const scene = new Scene({
      triggerElement: this.content,
      triggerHook: 'onLeave',
      duration: this.content.offsetHeight
    })
    .on('update', () => this._updateItems(items, this.controller.getScrollPos()));

    this.parallaxScenes.push(scene);
    this.controller.addScene(scene);
  }

  _buildScenesParallax(items) {
    items.forEach(item => {
      let during = false;

      const scene = new Scene({
        triggerElement: item.trigger,
        triggerHook: item.hook,
        duration: item.duration
      })
      .on('update', () => {
        if (during) {
          const startPos = scene.triggerElement().offsetTop - (scene.triggerHook() * scene.triggerElement().offsetHeight);

          const delta = this.controller.getScrollPos() - startPos;

          this._updateItems([item], delta);
        }
      })
      .on('enter', () => during = true)
      .on('leave', () => during = false);

      if (item.indicator) {
        scene.addIndicators({ name: item.indicator });
      }
  
      this.parallaxScenes.push(scene);
      this.controller.addScene(scene);
    });
  }

  _updateItems(items, offsetY) {
    items.forEach(item => {
      if (item.momentum > 0) {
        TweenMax.to(item.element, item.momentum, {
          y: offsetY/item.speed,
          ease: item.ease
        });
      } else {
        TweenMax.set(item.element, {
          y: offsetY/item.speed
        });
      }
    });
  }
};

export default ScrollController;
