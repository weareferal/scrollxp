import { component } from '../decorators';

import ScrollMagic from 'scrollmagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';


import Controller from '../scroll/controller';
import Scene from '../scroll/scene';
import { BreakpointListener } from '../utils';
import breakpoints from '../../breakpoints';
import { TweenMax, TimelineMax } from 'gsap';


@component('scrollController')
class ScrollController {
  constructor(element) {
    this.element = element;
    this.content = this.element.children[0];

    this.smoothScrolling = false;

    this.default = this._getDefaults();

    this.elementsList = [];
    this.tweensList = [];
    this.parallaxScenes = [];
    this.scenesList = [];

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
      this.buildScenes();
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
        const stagger = this.getParallaxProperty(element, 'stagger', null);
        const ease = eval(this.getParallaxProperty(element, 'ease', 'Power0.easeNone'));

        let item = {
          element: element,
          speed: speed,
          momentum: momentum,
          stagger: stagger,
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
          const offset = this.getParallaxProperty(element, 'offset', 0);
          const hook = this.getParallaxProperty(element, 'hook', 'onCenter');
          const indicator = this.getParallaxProperty(element, 'indicator', null);

          item = Object.assign(item, {
            trigger: trigger,
            duration: duration,
            offset: offset,
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

  buildScenes() {
    const domScenes = this.element.querySelectorAll('[data-scene]');

    domScenes.forEach(domScene => {
      const isEnabled = eval(this.getSceneProperty(domScene, 'enabled', this.default.scene.enabled));

      if (isEnabled) {
        const scene = new Scene({
          triggerElement: this.getSceneProperty(domScene, 'trigger', domScene),
          triggerHook: this.getSceneProperty(domScene, 'hook', this.default.scene.triggerHook),
          duration: this.getSceneProperty(domScene, 'duration', this.default.scene.duration),
          reverse: this.getSceneProperty(domScene, 'reverse', this.default.scene.reverse)
        });

        const indicator = this.getSceneProperty(domScene, 'indicator', this.default.scene.indicator);
        if (indicator) {
          scene.addIndicators({ name: indicator });
        }

        const classToggle = this.getSceneProperty(domScene, 'class-toggle', this.default.scene.classToggle);
        const pin = this.getSceneProperty(domScene, 'pin', this.default.scene.pin);
        const sceneName = this.getSceneProperty(domScene, 'scene', this.default.scene.name);

        if (classToggle) {
          scene.setClassToggle(domScene, classToggle);
        }
        else if (pin) {
          scene.setPin(domScene);
        } else if (sceneName) {
          this._createCustomAnimation(scene, domScene, sceneName);
        } else {
          this._createAnimation(scene, domScene);
        }

        this.controller.addScene(scene);
        this.scenesList.push(scene);
      }
    });
  }

  resetScenes() {
    this.parallaxScenes.forEach(scene => this.controller.removeScene(scene));
    this.parallaxScenes = [];

    this.tweensList.forEach(tween => tween.clear());

    this.scenesList.forEach(scene => {
      scene.removePin(true);
      this.controller.removeScene(scene)
    });

    TweenMax.set(this.elementsList, {
      clearProps: 'all'
    });

    this.tweensList = [];
    this.scenesList = [];
    this.elementsList = [];
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

  getInertiaProperty(item, property, defaultValue) {
    return this.getDataProperty('inertia-scene', item, property, defaultValue);
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
        duration: item.duration,
        offset: item.offset
      })
      .on('update', () => {
        if (during) {
          const startPos = scene.triggerElement().offsetTop - (scene.triggerHook() * scene.duration());

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
      if (item.stagger) {
        TweenMax.staggerTo(item.element.children, item.momentum, {
          y: offsetY/item.speed,
          ease: item.ease
        }, item.stagger);
      } else {
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
      }
    });
  }

  _createAnimation(scene, domScene) {
    let tween = new TimelineMax().add('start');

    const items = domScene.querySelectorAll('[data-animate]');
    items.forEach(item => {
      const animation = this.getAnimationProperty(item, 'animate', this.default.animation.name);

      const animationProps = {
        autoAlpha: {
          from: this.getAnimationProperty(item, 'from-alpha', this.default.animation.alpha.from),
          to: this.getAnimationProperty(item, 'to-alpha', this.default.animation.alpha.to)
        },
        x: {
          from: this.getAnimationProperty(item, 'from-x', this.default.animation.x.from),
          to: this.getAnimationProperty(item, 'to-x', this.default.animation.x.to)
        },
        y: {
          from: this.getAnimationProperty(item, 'from-y', this.default.animation.y.from),
          to: this.getAnimationProperty(item, 'to-y', this.default.animation.y.to)
        },
        xPercent: {
          from: this.getAnimationProperty(item, 'from-x-percent', this.default.animation.xPercent.from),
          to: this.getAnimationProperty(item, 'to-x-percent', this.default.animation.xPercent.to)
        },
        yPercent: {
          from: this.getAnimationProperty(item, 'from-y-percent', this.default.animation.yPercent.from),
          to: this.getAnimationProperty(item, 'to-y-percent', this.default.animation.yPercent.to)
        },
        scale: {
          from: this.getAnimationProperty(item, 'from-scale', this.default.animation.scale.from),
          to: this.getAnimationProperty(item, 'to-scale', this.default.animation.scale.to)
        },
        rotation: {
          from: this.getAnimationProperty(item, 'from-rotation', this.default.animation.rotation.from),
          to: this.getAnimationProperty(item, 'to-rotation', this.default.animation.rotation.to)
        },
        width: {
          from: this.getAnimationProperty(item, 'from-width', this.default.animation.width.from),
          to: this.getAnimationProperty(item, 'to-width', this.default.animation.width.to)
        }
      };

      const extraProps = {
        ease: eval(this.getAnimationProperty(item, 'ease', this.default.animation.ease)),
        repeat: eval(this.getAnimationProperty(item, 'repeat', this.default.animation.repeat)),
        yoyo: eval(this.getAnimationProperty(item, 'yoyo', this.default.animation.yoyo)),
        delay: eval(this.getAnimationProperty(item, 'delay', this.default.animation.delay))
      };

      const duration = this.getAnimationProperty(item, 'duration', this.default.animation.duration);
      const position = this.getAnimationProperty(item, 'position', this.default.animation.position);
      const stagger = this.getAnimationProperty(item, 'stagger', this.default.animation.stagger);
      const label = this.getAnimationProperty(item, 'label', this.default.animation.label);
      const transition = this.getAnimationProperty(item, 'transition', this.default.animation.transition);

      const fromProps = this._buildState('from', animationProps);
      const toProps = this._buildState('to', animationProps);

      if (!animation) {
        let hasProperties = fromProps || toProps;
        if (hasProperties) {
          if (stagger) {
            if (fromProps && toProps) {
              tween.staggerFromTo(item.children, duration, fromProps, Object.assign(toProps, extraProps), stagger, position);
            }
            else if (fromProps) {
              tween.staggerFrom(item.children, duration, Object.assign(fromProps, extraProps), stagger, position);
            }
            else {
              tween.staggerTo(item.children, duration, Object.assign(toProps, extraProps), stagger, position);
            }
            this.elementsList.push(item.children);
          } else {
            if (fromProps && toProps) {
              tween.fromTo(item, duration, fromProps, Object.assign(toProps, extraProps), position);
            }
            else if (fromProps) {
              tween.from(item, duration, Object.assign(fromProps, extraProps), position);
            }
            else {
              tween.to(item, duration, Object.assign(toProps, extraProps), position);
            }
            this.elementsList.push(item);
          }
        }
      }

      if (label) {
        tween.add(label);
      }

      if (transition) {
        item.style.transition = transition;
      }
    });

    scene.setTween(tween);

    this.tweensList.push(tween);
  }

  _createCustomAnimation(scene, domScene, sceneName) {
    // Implement custom animations here
  }

  _getDefaults() {
    return {
      controller: {
        container: window,
        addIndicators: false
      },
      scene: {
        name: null,
        triggerHook: 'onCenter',
        duration: 0,
        reverse: true,
        classToggle: null,
        pin: false,
        enabled: true,
        indicator: false
      },
      animation: {
        name: null,
        duration: 1,
        position: '+=0',
        stagger: null,
        transition: null,
        ease: null,
        repeat: 0,
        yoyo: false,
        delay: 0,
        label: null,
        alpha: {
          from: null,
          to: null
        },
        x: {
          from: null,
          to: null
        },
        y: {
          from: null,
          to: null
        },
        xPercent: {
          from: null,
          to: null
        },
        yPercent: {
          from: null,
          to: null
        },
        scale: {
          from: null,
          to: null
        },
        rotation: {
          from: null,
          to: null
        },
        width: {
          from: null,
          to: null
        }
      }
    };
  }

  _buildState(stateKey, properties) {
    let state;
    Object.keys(properties).forEach(key => {
      if (properties[key][stateKey] !== null) {
        if (!state) {
          state = {};
        }
        state[key] = properties[key][stateKey];
      }
    });
    return state;
  }
};

export default ScrollController;
