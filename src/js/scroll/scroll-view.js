import ScrollController from './scroll-controller';
import ScrollScene from './scroll-scene';
import { BreakpointListener, PropertyHelper } from './utils';
import { TweenMax, TimelineMax } from 'gsap';


class ScrollView {
  constructor(options) {
    this._container = options.container || window;
    this._content = this._container.children[0];

    this._smoothScrolling = options.smoothScrolling || false;

    this._helper = new PropertyHelper(options.breakpoints);

    this._defaults = Object.assign({
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
    }, options.defaults);

    // These lists keep DOM elements, tweens and scenes, so that when we resize the screen and reach a breakpoint,
    // the elements are reset and the scenes are removed, rebuilt and added again.
    this._domElements = [];
    this._tweens = [];
    this._scenes = [];

    this._sceneModifiers = {};

    // This content scene is used to update scroll progress when a scroll listener is added
    this._contentScene = new ScrollScene({
      triggerElement: this._content,
      triggerHook: 'onLeave',
      duration: this._content.offsetHeight
    });

    // TODO: Instead of checking for xs, check for isMobile somehow (actual devices)
    new BreakpointListener(({ screenSize, hasChanged }) => {
      if (hasChanged) {
        // First load
        if (!this._controller) {
          this._controller = new ScrollController({
            container: this._container,
            smoothScrolling: screenSize === 'xs' ? false : this._smoothScrolling,
            addIndicators: options.addIndicators || false
          });

          this._controller.addScene(this._contentScene);
        } else {
          // Disable smooth scrolling on mobile
          if (this._smoothScrolling) {
            if (screenSize === 'xs') {
              this._controller.smoothScrolling(false);
            } else {
              this._controller.smoothScrolling(true);
            }
          }
        }

        console.debug('[ScrollView] Rebuilding scenes for:', screenSize);
        this._rebuild();
      }

      // Update content scene duration, so the scroll progress is adjusted
      this._contentScene.duration(this._content.offsetHeight);

    }, this._helper.breakpoints());
  }

  bindAnchors(anchors) {
    anchors.forEach(anchor => {
      // Bind scroll to anchor
      anchor.addEventListener('click', e => {
        const id = e.currentTarget.getAttribute('href');
        if (id.length > 0) {
          e.preventDefault();

          this._controller.scrollTo(id);
        }
      });
      // Bind anchor to scroll
      const id = anchor.getAttribute('href');
      const section = this._container.querySelector(id);
      this._controller.addScene(
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

  registerSceneModifier(modifierName, modifierFunction) {
    this._sceneModifiers[modifierName] = modifierFunction;
  }

  addScrollListener(listener) {
    this._contentScene.on('progress', listener);
  }

  removeScrollListener(listener) {
    this._contentScene.off('progress', listener);
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

  _buildScenes() {
    const domScenes = this._container.querySelectorAll('[data-scene]');

    domScenes.forEach(domScene => {

      const isEnabled = eval(this._helper.getSceneProperty(domScene, 'enabled', this._defaults.scene.enabled));

      if (isEnabled) {

        let scene = new ScrollScene({
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
        const modifierName = this._helper.getSceneProperty(domScene, 'scene', this._defaults.scene.modifierName);

        if (classToggle) {
          scene.setClassToggle(domScene, classToggle);
        } else if (pin) {
          scene.setPin(domScene);
        } else if (modifierName) {
          scene = this._applySceneModifier(modifierName, scene, domScene);
        } else {
          this._createAnimation(scene, domScene);
        }

        this._controller.addScene(scene);
        this._scenes.push(scene);
      }
    });
  }

  _createAnimation(scene, domScene) {
    let tween = new TimelineMax().add('start');

    const domElements = domScene.querySelectorAll('[data-animate]');

    domElements.forEach(domElement => {

      const animation = this._helper.getAnimationProperty(domElement, 'animate', this._defaults.animation.name);

      const animationProps = {
        autoAlpha: {
          from: this._helper.getAnimationProperty(domElement, 'from-alpha', this._defaults.animation.alpha.from),
          to: this._helper.getAnimationProperty(domElement, 'to-alpha', this._defaults.animation.alpha.to)
        },
        x: {
          from: this._helper.getAnimationProperty(domElement, 'from-x', this._defaults.animation.x.from),
          to: this._helper.getAnimationProperty(domElement, 'to-x', this._defaults.animation.x.to)
        },
        y: {
          from: this._helper.getAnimationProperty(domElement, 'from-y', this._defaults.animation.y.from),
          to: this._helper.getAnimationProperty(domElement, 'to-y', this._defaults.animation.y.to)
        },
        xPercent: {
          from: this._helper.getAnimationProperty(domElement, 'from-x-percent', this._defaults.animation.xPercent.from),
          to: this._helper.getAnimationProperty(domElement, 'to-x-percent', this._defaults.animation.xPercent.to)
        },
        yPercent: {
          from: this._helper.getAnimationProperty(domElement, 'from-y-percent', this._defaults.animation.yPercent.from),
          to: this._helper.getAnimationProperty(domElement, 'to-y-percent', this._defaults.animation.yPercent.to)
        },
        scale: {
          from: this._helper.getAnimationProperty(domElement, 'from-scale', this._defaults.animation.scale.from),
          to: this._helper.getAnimationProperty(domElement, 'to-scale', this._defaults.animation.scale.to)
        },
        rotation: {
          from: this._helper.getAnimationProperty(domElement, 'from-rotation', this._defaults.animation.rotation.from),
          to: this._helper.getAnimationProperty(domElement, 'to-rotation', this._defaults.animation.rotation.to)
        },
        width: {
          from: this._helper.getAnimationProperty(domElement, 'from-width', this._defaults.animation.width.from),
          to: this._helper.getAnimationProperty(domElement, 'to-width', this._defaults.animation.width.to)
        }
      };

      const extraProps = {
        ease: eval(this._helper.getAnimationProperty(domElement, 'ease', this._defaults.animation.ease)),
        repeat: eval(this._helper.getAnimationProperty(domElement, 'repeat', this._defaults.animation.repeat)),
        yoyo: eval(this._helper.getAnimationProperty(domElement, 'yoyo', this._defaults.animation.yoyo)),
        delay: eval(this._helper.getAnimationProperty(domElement, 'delay', this._defaults.animation.delay))
      };

      const duration = this._helper.getAnimationProperty(domElement, 'duration', this._defaults.animation.duration);
      const position = this._helper.getAnimationProperty(domElement, 'position', this._defaults.animation.position);
      const stagger = this._helper.getAnimationProperty(domElement, 'stagger', this._defaults.animation.stagger);
      const label = this._helper.getAnimationProperty(domElement, 'label', this._defaults.animation.label);
      const transition = this._helper.getAnimationProperty(domElement, 'transition', this._defaults.animation.transition);

      const fromProps = this._buildState('from', animationProps);
      const toProps = this._buildState('to', animationProps);

      if (!animation) {
        let hasProperties = fromProps || toProps;
        if (hasProperties) {
          if (stagger) {
            if (fromProps && toProps) {
              tween.staggerFromTo(domElement.children, duration, fromProps, Object.assign(toProps, extraProps), stagger, position);
            }
            else if (fromProps) {
              tween.staggerFrom(domElement.children, duration, Object.assign(fromProps, extraProps), stagger, position);
            }
            else {
              tween.staggerTo(domElement.children, duration, Object.assign(toProps, extraProps), stagger, position);
            }
            this._domElements.push(domElement.children);
          } else {
            if (fromProps && toProps) {
              tween.fromTo(domElement, duration, fromProps, Object.assign(toProps, extraProps), position);
            }
            else if (fromProps) {
              tween.from(domElement, duration, Object.assign(fromProps, extraProps), position);
            }
            else {
              tween.to(domElement, duration, Object.assign(toProps, extraProps), position);
            }
            this._domElements.push(domElement);
          }
        }
      }

      if (label) {
        tween.add(label);
      }

      if (transition) {
        domElement.style.transition = transition;
      }
    });

    scene.setTween(tween);

    this._tweens.push(tween);
  }

  // TODO: Refactor this. Custom scenes must be implemented outside ScrollView and applied here
  /**
   * A modifier must be registered in the scroll view in order to be applied.
   * 
   * As data-* attributes can't cover eveything we want to do with scenes, we can apply custom behavior
   * to it through scene modifiers.
   * 
   * @param {*} modifierName
   * @param {*} scene
   * @param {*} domScene
   */
  _applySceneModifier(modifierName, scene, domScene) {
    const modifierFunction = this._sceneModifiers[modifierName];
    if (modifierFunction) {
      const modifier = modifierFunction(domScene);

      if (modifier.tween !== undefined) {
        let tween = new TimelineMax().add(modifier.tween);

        scene.setTween(tween);
        this._tweens.push(tween);
      }

      if (modifier.duration !== undefined) {
        scene.duration(modifier.duration);
      }

      if (modifier.onEnter !== undefined) {
        scene.on('enter', modifier.onEnter);
      }

      if (modifier.pin !== undefined) {
        scene.setPin(modifier.pin);
      }

      this._domElements.push(domScene);
    }
    return scene;
  }

  _buildParallaxScenes() {
    const globalItems = [];
    const sceneItems = [];

    const domElements = this._container.querySelectorAll('[data-parallax]');

    domElements.forEach(domElement => {

      const isEnabled = eval(this._helper.getParallaxProperty(domElement, 'enabled', this._defaults.parallax.enabled));

      if (isEnabled) {
        const speed = this._helper.getParallaxProperty(domElement, 'speed', this._defaults.parallax.speed);
        const momentum = this._helper.getParallaxProperty(domElement, 'momentum', this._defaults.parallax.momentum);
        const stagger = this._helper.getParallaxProperty(domElement, 'stagger', this._defaults.parallax.stagger);
        const ease = eval(this._helper.getParallaxProperty(domElement, 'ease', this._defaults.parallax.ease));

        let item = {
          domElement: domElement,
          speed: speed,
          momentum: momentum,
          stagger: stagger,
          ease: ease
        };

        const parallaxType = this._helper.getParallaxProperty(domElement, 'parallax', this._defaults.parallax.type);

        // Global items
        if (parallaxType === 'global') {
          globalItems.push(item);
        }
        // Scene items
        else if (parallaxType === 'scene') {
          const trigger = this._helper.getParallaxProperty(domElement, 'trigger', this._defaults.parallax.trigger);
          const duration = this._helper.getParallaxProperty(domElement, 'duration', this._defaults.parallax.duration);
          const offset = this._helper.getParallaxProperty(domElement, 'offset', this._defaults.parallax.offset);
          const hook = this._helper.getParallaxProperty(domElement, 'hook', this._defaults.parallax.hook);
          const indicator = this._helper.getParallaxProperty(domElement, 'indicator', this._defaults.parallax.indicator);

          item = Object.assign(item, {
            trigger: trigger,
            duration: duration,
            offset: offset,
            hook: hook,
            indicator: indicator
          });

          sceneItems.push(item);
        }
      } else {
        TweenMax.set(domElement, { clearProps: 'all' });
      }
    });

    if (globalItems.length > 0) {
      this._buildGlobalParallax(globalItems);
    }

    if (sceneItems.length > 0) {
      this._buildScenesParallax(sceneItems);
    }
  }

  _buildGlobalParallax(items) {
    const scene = new ScrollScene({
      triggerElement: this._content,
      triggerHook: 'onLeave',
      duration: this._content.offsetHeight
    })
    .on('update', () => this._updateParallaxItems(items, this._controller.getScrollPos()));

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

          this._updateParallaxItems([item], delta);
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

  _updateParallaxItems(items, offsetY) {
    items.forEach(item => {
      if (item.stagger) {
        TweenMax.staggerTo(item.domElement.children, item.momentum, {
          y: offsetY/item.speed,
          ease: item.ease
        }, item.stagger);
      } else {
        if (item.momentum > 0) {
          TweenMax.to(item.domElement, item.momentum, {
            y: offsetY/item.speed,
            ease: item.ease
          });
        } else {
          TweenMax.set(item.domElement, {
            y: offsetY/item.speed
          });
        }
      }
    });
  }

  _resetScenes() {
    this._tweens.forEach(tween => tween.clear());

    this._scenes.forEach(scene => {
      scene.removePin(true);
      this._controller.removeScene(scene);
    });

    TweenMax.set(this._domElements, {
      clearProps: 'all'
    });

    this._tweens = [];
    this._scenes = [];
    this._domElements = [];
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
