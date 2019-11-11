import ScrollController from './scroll-controller';
import ScrollScene from './scroll-scene';
import { BreakpointListener, PropertyHelper } from './utils';
import { TweenMax, TimelineMax } from 'gsap';


class ScrollView {
  constructor(element, breakpoints) {
    this._container = element;
    this._content = this._container.children[0];

    this._smoothScrolling = false;

    this._domElements = [];
    this._tweens = [];
    this._scenes = [];

    this._helper = new PropertyHelper(breakpoints);

    this._defaults = {
      parallax: {
        enabled: true,
        type: 'global',
        speed: 1,
        momentum: .3,
        stagger: null,
        ease: 'Power0.easeNone',
        trigger: this._container.parentNode,
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

    this._controller = new ScrollController({
      container: this._container,
      smoothScrolling: this._smoothScrolling,
      addIndicators: false
    });

    new BreakpointListener(({ screenSize, hasChanged }) => {
      if (hasChanged) {
        // Disable smooth scrolling on mobile
        if (this._smoothScrolling) {
          if (screenSize === 'xs') {
            this._controller.smoothScrolling(false);
          } else {
            this._controller.smoothScrolling(true);
          }
        }

        console.debug('[ScrollView] Rebuiling scenes for:', screenSize);

        this._rebuild();
      }
    }, breakpoints);
  }

  bindAnchors(anchors) {
    this._controller.bindAnchors(anchors);
  }

  smoothScrolling(newSmoothScrolling) {
    if (!arguments.length) {
      return this._smoothScrolling;
    } else {
      this._controller.smoothScrolling(newSmoothScrolling);
      this._rebuild();
    }
  }

  _rebuild() {
    setTimeout(() => {
      this._resetScenes();
      this._buildParallaxScenes();
      this._buildScenes();
    }, 0);
  }

  _buildParallaxScenes() {
    const globalElements = [];
    const sceneElements = [];

    const elements = this._container.querySelectorAll('[data-parallax]');

    elements.forEach(element => {
      const isEnabled = eval(this._helper.getParallaxProperty(element, 'enabled', this._defaults.parallax.enabled));

      if (isEnabled) {
        const speed = this._helper.getParallaxProperty(element, 'speed', this._defaults.parallax.speed);
        const momentum = this._helper.getParallaxProperty(element, 'momentum', this._defaults.parallax.momentum);
        const stagger = this._helper.getParallaxProperty(element, 'stagger', this._defaults.parallax.stagger);
        const ease = eval(this._helper.getParallaxProperty(element, 'ease', this._defaults.parallax.ease));

        let item = {
          element: element,
          speed: speed,
          momentum: momentum,
          stagger: stagger,
          ease: ease
        };

        const parallaxType = this._helper.getParallaxProperty(element, 'parallax', this._defaults.parallax.type);

        // Global items
        if (parallaxType === 'global') {
          globalElements.push(item);
        }
        // Scene items
        else if (parallaxType === 'scene') {
          const trigger = this._helper.getParallaxProperty(element, 'trigger', this._defaults.parallax.trigger);
          const duration = this._helper.getParallaxProperty(element, 'duration', this._defaults.parallax.duration);
          const offset = this._helper.getParallaxProperty(element, 'offset', this._defaults.parallax.offset);
          const hook = this._helper.getParallaxProperty(element, 'hook', this._defaults.parallax.hook);
          const indicator = this._helper.getParallaxProperty(element, 'indicator', this._defaults.parallax.indicator);

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

  _buildScenes() {
    const domScenes = this._container.querySelectorAll('[data-scene]');

    domScenes.forEach(domScene => {
      const isEnabled = eval(this._helper.getSceneProperty(domScene, 'enabled', this._defaults.scene.enabled));

      if (isEnabled) {
        const scene = new ScrollScene({
          triggerElement: this._helper.getSceneProperty(domScene, 'trigger', domScene),
          triggerHook: this._helper.getSceneProperty(domScene, 'hook', this._defaults.scene.triggerHook),
          duration: this._helper.getSceneProperty(domScene, 'duration', this._defaults.scene.duration),
          reverse: this._helper.getSceneProperty(domScene, 'reverse', this._defaults.scene.reverse)
        });

        const indicator = this._helper.getSceneProperty(domScene, 'indicator', this._defaults.scene.indicator);
        if (indicator) {
          scene.addIndicators({ name: indicator });
        }

        const classToggle = this._helper.getSceneProperty(domScene, 'class-toggle', this._defaults.scene.classToggle);
        const pin = this._helper.getSceneProperty(domScene, 'pin', this._defaults.scene.pin);
        const sceneName = this._helper.getSceneProperty(domScene, 'scene', this._defaults.scene.name);

        if (classToggle) {
          scene.setClassToggle(domScene, classToggle);
        } else if (pin) {
          scene.setPin(domScene);
        } else if (sceneName) {
          this._createCustomAnimation(scene, domScene, sceneName);
        } else {
          this._createAnimation(scene, domScene);
        }

        this._controller.addScene(scene);
        this._scenes.push(scene);
      }
    });
  }

  _buildGlobalParallax(items) {
    const scene = new ScrollScene({
      triggerElement: this._content,
      triggerHook: 'onLeave',
      duration: this._content.offsetHeight
    })
    .on('update', () => this._updateItems(items, this._controller.getScrollPos()));

    this._scenes.push(scene);
    this._controller.addScene(scene);
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

          const delta = this._controller.getScrollPos() - startPos;

          this._updateItems([item], delta);
        }
      })
      .on('enter', () => during = true)
      .on('leave', () => during = false);

      if (item.indicator) {
        scene.addIndicators({ name: item.indicator });
      }
  
      this._scenes.push(scene);
      this._controller.addScene(scene);
    });
  }

  _resetScenes() {
    this._tweens.forEach(tween => tween.clear());

    this._scenes.forEach(scene => {
      scene.removePin(true);
      this._controller.removeScene(scene)
    });

    TweenMax.set(this._domElements, {
      clearProps: 'all'
    });

    this._tweens = [];
    this._scenes = [];
    this._domElements = [];
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
      const animation = this._helper.getAnimationProperty(item, 'animate', this._defaults.animation.name);

      const animationProps = {
        autoAlpha: {
          from: this._helper.getAnimationProperty(item, 'from-alpha', this._defaults.animation.alpha.from),
          to: this._helper.getAnimationProperty(item, 'to-alpha', this._defaults.animation.alpha.to)
        },
        x: {
          from: this._helper.getAnimationProperty(item, 'from-x', this._defaults.animation.x.from),
          to: this._helper.getAnimationProperty(item, 'to-x', this._defaults.animation.x.to)
        },
        y: {
          from: this._helper.getAnimationProperty(item, 'from-y', this._defaults.animation.y.from),
          to: this._helper.getAnimationProperty(item, 'to-y', this._defaults.animation.y.to)
        },
        xPercent: {
          from: this._helper.getAnimationProperty(item, 'from-x-percent', this._defaults.animation.xPercent.from),
          to: this._helper.getAnimationProperty(item, 'to-x-percent', this._defaults.animation.xPercent.to)
        },
        yPercent: {
          from: this._helper.getAnimationProperty(item, 'from-y-percent', this._defaults.animation.yPercent.from),
          to: this._helper.getAnimationProperty(item, 'to-y-percent', this._defaults.animation.yPercent.to)
        },
        scale: {
          from: this._helper.getAnimationProperty(item, 'from-scale', this._defaults.animation.scale.from),
          to: this._helper.getAnimationProperty(item, 'to-scale', this._defaults.animation.scale.to)
        },
        rotation: {
          from: this._helper.getAnimationProperty(item, 'from-rotation', this._defaults.animation.rotation.from),
          to: this._helper.getAnimationProperty(item, 'to-rotation', this._defaults.animation.rotation.to)
        },
        width: {
          from: this._helper.getAnimationProperty(item, 'from-width', this._defaults.animation.width.from),
          to: this._helper.getAnimationProperty(item, 'to-width', this._defaults.animation.width.to)
        }
      };

      const extraProps = {
        ease: eval(this._helper.getAnimationProperty(item, 'ease', this._defaults.animation.ease)),
        repeat: eval(this._helper.getAnimationProperty(item, 'repeat', this._defaults.animation.repeat)),
        yoyo: eval(this._helper.getAnimationProperty(item, 'yoyo', this._defaults.animation.yoyo)),
        delay: eval(this._helper.getAnimationProperty(item, 'delay', this._defaults.animation.delay))
      };

      const duration = this._helper.getAnimationProperty(item, 'duration', this._defaults.animation.duration);
      const position = this._helper.getAnimationProperty(item, 'position', this._defaults.animation.position);
      const stagger = this._helper.getAnimationProperty(item, 'stagger', this._defaults.animation.stagger);
      const label = this._helper.getAnimationProperty(item, 'label', this._defaults.animation.label);
      const transition = this._helper.getAnimationProperty(item, 'transition', this._defaults.animation.transition);

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
            this._domElements.push(item.children);
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
            this._domElements.push(item);
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

    this._tweens.push(tween);
  }

  _createCustomAnimation(scene, domScene, sceneName) {
    // Implement custom animations here
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
