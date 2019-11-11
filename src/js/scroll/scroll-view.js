import ScrollController from './scroll-controller';
import ScrollScene from './scroll-scene';
import { BreakpointListener, PropertyHelper } from './utils';
import { TweenMax, TimelineMax } from 'gsap';


class ScrollView {
  constructor(element, breakpoints) {
    this.element = element;
    this.content = this.element.children[0];

    this.smoothScrolling = false;

    this.default = this._getDefaults();

    this.helper = new PropertyHelper(breakpoints);

    this.elementsList = [];
    this.tweensList = [];
    this.scenesList = [];

    this.controller = new ScrollController({
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
        console.debug('[ScrollView] Rebuiling scenes for:', screenSize);
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
      const isEnabled = eval(this.helper.getParallaxProperty(element, 'enabled', this.default.parallax.enabled));

      if (isEnabled) {
        const speed = this.helper.getParallaxProperty(element, 'speed', this.default.parallax.speed);
        const momentum = this.helper.getParallaxProperty(element, 'momentum', this.default.parallax.momentum);
        const stagger = this.helper.getParallaxProperty(element, 'stagger', this.default.parallax.stagger);
        const ease = eval(this.helper.getParallaxProperty(element, 'ease', this.default.parallax.ease));

        let item = {
          element: element,
          speed: speed,
          momentum: momentum,
          stagger: stagger,
          ease: ease
        };

        const parallaxType = this.helper.getParallaxProperty(element, 'parallax', this.default.parallax.type);

        // Global items
        if (parallaxType === 'global') {
          globalElements.push(item);
        }
        // Scene items
        else if (parallaxType === 'scene') {
          const trigger = this.helper.getParallaxProperty(element, 'trigger', this.default.parallax.trigger);
          const duration = this.helper.getParallaxProperty(element, 'duration', this.default.parallax.duration);
          const offset = this.helper.getParallaxProperty(element, 'offset', this.default.parallax.offset);
          const hook = this.helper.getParallaxProperty(element, 'hook', this.default.parallax.hook);
          const indicator = this.helper.getParallaxProperty(element, 'indicator', this.default.parallax.indicator);

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
      const isEnabled = eval(this.helper.getSceneProperty(domScene, 'enabled', this.default.scene.enabled));

      if (isEnabled) {
        const scene = new ScrollScene({
          triggerElement: this.helper.getSceneProperty(domScene, 'trigger', domScene),
          triggerHook: this.helper.getSceneProperty(domScene, 'hook', this.default.scene.triggerHook),
          duration: this.helper.getSceneProperty(domScene, 'duration', this.default.scene.duration),
          reverse: this.helper.getSceneProperty(domScene, 'reverse', this.default.scene.reverse)
        });

        const indicator = this.helper.getSceneProperty(domScene, 'indicator', this.default.scene.indicator);
        if (indicator) {
          scene.addIndicators({ name: indicator });
        }

        const classToggle = this.helper.getSceneProperty(domScene, 'class-toggle', this.default.scene.classToggle);
        const pin = this.helper.getSceneProperty(domScene, 'pin', this.default.scene.pin);
        const sceneName = this.helper.getSceneProperty(domScene, 'scene', this.default.scene.name);

        if (classToggle) {
          scene.setClassToggle(domScene, classToggle);
        } else if (pin) {
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

  _buildGlobalParallax(items) {
    const scene = new ScrollScene({
      triggerElement: this.content,
      triggerHook: 'onLeave',
      duration: this.content.offsetHeight
    })
    .on('update', () => this._updateItems(items, this.controller.getScrollPos()));

    this.scenesList.push(scene);
    this.controller.addScene(scene);
  }

  _buildScenesParallax(items) {
    items.forEach(item => {
      let during = false;

      const scene = new ScrollScene({
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
  
      this.scenesList.push(scene);
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
      const animation = this.helper.getAnimationProperty(item, 'animate', this.default.animation.name);

      const animationProps = {
        autoAlpha: {
          from: this.helper.getAnimationProperty(item, 'from-alpha', this.default.animation.alpha.from),
          to: this.helper.getAnimationProperty(item, 'to-alpha', this.default.animation.alpha.to)
        },
        x: {
          from: this.helper.getAnimationProperty(item, 'from-x', this.default.animation.x.from),
          to: this.helper.getAnimationProperty(item, 'to-x', this.default.animation.x.to)
        },
        y: {
          from: this.helper.getAnimationProperty(item, 'from-y', this.default.animation.y.from),
          to: this.helper.getAnimationProperty(item, 'to-y', this.default.animation.y.to)
        },
        xPercent: {
          from: this.helper.getAnimationProperty(item, 'from-x-percent', this.default.animation.xPercent.from),
          to: this.helper.getAnimationProperty(item, 'to-x-percent', this.default.animation.xPercent.to)
        },
        yPercent: {
          from: this.helper.getAnimationProperty(item, 'from-y-percent', this.default.animation.yPercent.from),
          to: this.helper.getAnimationProperty(item, 'to-y-percent', this.default.animation.yPercent.to)
        },
        scale: {
          from: this.helper.getAnimationProperty(item, 'from-scale', this.default.animation.scale.from),
          to: this.helper.getAnimationProperty(item, 'to-scale', this.default.animation.scale.to)
        },
        rotation: {
          from: this.helper.getAnimationProperty(item, 'from-rotation', this.default.animation.rotation.from),
          to: this.helper.getAnimationProperty(item, 'to-rotation', this.default.animation.rotation.to)
        },
        width: {
          from: this.helper.getAnimationProperty(item, 'from-width', this.default.animation.width.from),
          to: this.helper.getAnimationProperty(item, 'to-width', this.default.animation.width.to)
        }
      };

      const extraProps = {
        ease: eval(this.helper.getAnimationProperty(item, 'ease', this.default.animation.ease)),
        repeat: eval(this.helper.getAnimationProperty(item, 'repeat', this.default.animation.repeat)),
        yoyo: eval(this.helper.getAnimationProperty(item, 'yoyo', this.default.animation.yoyo)),
        delay: eval(this.helper.getAnimationProperty(item, 'delay', this.default.animation.delay))
      };

      const duration = this.helper.getAnimationProperty(item, 'duration', this.default.animation.duration);
      const position = this.helper.getAnimationProperty(item, 'position', this.default.animation.position);
      const stagger = this.helper.getAnimationProperty(item, 'stagger', this.default.animation.stagger);
      const label = this.helper.getAnimationProperty(item, 'label', this.default.animation.label);
      const transition = this.helper.getAnimationProperty(item, 'transition', this.default.animation.transition);

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
      parallax: {
        enabled: true,
        type: 'global',
        speed: 1,
        momentum: .3,
        stagger: null,
        ease: 'Power0.easeNone',
        trigger: this.element.parentNode,
        duration: '100%',
        offset: 0,
        hook: 'onCenter',
        indicator: null
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

export default ScrollView;
