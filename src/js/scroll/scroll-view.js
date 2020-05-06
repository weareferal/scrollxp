import ScrollController from './scroll-controller';
import ScrollScene from './scroll-scene';
import { BreakpointListener, PropertyHelper, mergeDeep } from './utils';
import { TweenMax, TimelineMax } from 'gsap';

/**
 * !!!IMPORTANT!!!
 * 
 * How it works:
 * - The attribute [data-scene] creates a scene with duration = 0,
 *   use [data-scene-*] to change the scene
 * - The attribute [data-animate] creates an animation,
 *   use [data-animate-*] to change the animation
 * - Animations get stacked in a timeline as they are declared
 * 
 * Rules:
 * - [data-animate-*] only works inside an unregistered scene, i.e., [data-scene]
 *   (if we change that, we have trouble with nested scenes)
 * - [data-scene="NAME"] can have nested scenes (registered and unregistered)
 * - [data-scene] can have only unregistered nested scenes
 * 
 * Registering scenes and animations:
 * - Animations can be customized to be reused, we do that by registering animations
 *   JS: this.view.registerAnimation('fade-in', duration: 1, { from: { autoAlpha: 0 } });
 *   HTML: <div data-animate="fade-in"></div>
 * - Scenes can be customized to allow more control over HTML elements, we do that by registering scenes
 *   JS: this.view.registerSceneModifier("reveal", function(
          domScene
        ) {
          return {
            onEnter: function() {
              domScene.classList.add("is-visible");
            },
            triggerHook: "0.8"
          };
      HTML: <div data-scene="reveal"></div>
 */
class ScrollView {
  constructor(options) {
    this._options = options;

    this._container = options.container || window;
    this._content = this._container.children[0];

    this._smoothScrolling = options.smoothScrolling || false;

    this._scrollOffset = options.scrollOffset || 0;

    this._helper = new PropertyHelper(options.breakpoints);

    this._defaults = mergeDeep({
      parallax: {
        enabled: true,
        type: 'global',
        speed: 1,
        momentum: 0,
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
        transformOrigin: null,
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
        rotationX: {
          from: null,
          to: null
        },
        rotationY: {
          from: null,
          to: null
        },
        skewX: {
          from: null,
          to: null
        },
        skewY: {
          from: null,
          to: null
        },
        width: {
          from: null,
          to: null
        },
        height: {
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

    // Keeps registered scene modifiers
    this._sceneModifiers = {};

    // Keeps registered animations
    this._animations = {};

    // TODO: Instead of checking for xs, check for isMobile somehow (actual devices)
    new BreakpointListener(({ screenSize, hasChanged }) => {
      if (hasChanged) {

        // First load
        if (!this._controller) {

          this._controller = new ScrollController({
            container: this._container,
            smoothScrolling: screenSize === 'xs' ? false : this._smoothScrolling,
            scrollOffset: options.scrollOffset || 0,
            addIndicators: options.addIndicators || false
          });

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
      if (this._contentScene) {
        this._contentScene.duration(this._content.offsetHeight);
      }

    }, this._helper.breakpoints());

    // Set up scrollTo anchors
    if (options.anchors && options.anchors.length > 0) {
      const anchors = Array.from(options.anchors).filter(anchor => anchor.hash.length > 1);
      this.setUpScrollTo(anchors);
    }
  }

  setUpScrollTo(anchors) {
    anchors.forEach(anchor => {
      anchor.addEventListener('click', e => {
        const id = e.currentTarget.getAttribute('href');
        if (id.length > 0) {
          e.preventDefault();

          this._controller.scrollTo(id);
        }
      });
    });
  }

  bindAnchors(anchors) {
    this.setUpScrollTo(anchors);

    // Bind anchor to scroll scenes
    anchors.forEach(anchor => {
      const id = anchor.getAttribute('href');
      const section = this._container.querySelector(id);
      const anchorScene = new ScrollScene({
        triggerElement: section,
        triggerHook: '0.01', // BUGFIX: Sometimes the scene isn't triggered for 1px difference, using this value fixes the issue.
        offset: this._scrollOffset,
        duration: function () {
          return section.offsetHeight;
        }
      })
      .on('enter', () => anchor.classList.add('is-active'))
      .on('leave', () => anchor.classList.remove('is-active'));

      if (this._options.addIndicators) {
        anchorScene.addIndicators({ name: id });
      }

      this._controller.addScene(anchorScene);
    });
  }

  scrollTo(targetId) {
    this._controller.scrollTo(targetId);
  }

  registerSceneModifier(modifierName, modifierFunction) {
    this._sceneModifiers[modifierName] = modifierFunction;
  }

  registerAnimation(animationName, animationProps) {
    this._animations[animationName] = animationProps;
  }

  addScrollListener(listener) {
    // This content scene is used to update scroll progress when a scroll listener is added
    if (!this._contentScene) {
      this._contentScene = new ScrollScene({
        triggerElement: this._content,
        triggerHook: 'onLeave',
        duration: this._content.offsetHeight
      });

      if (this._options.addIndicators) {
        this._contentScene.addIndicators({ name: 'content' });
      }

      this._controller.addScene(this._contentScene);
    }

    this._contentScene.on('progress', () => {
      const contentHeight = this._content.offsetHeight;
      const containerHeight = this._container.offsetHeight;
      const currentPos = this._controller.getScrollPos();

      let progress = currentPos/(contentHeight - containerHeight);

      if (progress < 0) {
        progress = 0;
      }

      if (progress > 1) {
        progress = 1;
      }

      listener(progress);
    });
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
          reverse: eval(this._helper.getSceneProperty(domScene, 'reverse', this._defaults.scene.reverse))
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
        rotationX: {
          from: this._helper.getAnimationProperty(domElement, 'from-rotation-x', this._defaults.animation.rotationX.from),
          to: this._helper.getAnimationProperty(domElement, 'to-rotation-x', this._defaults.animation.rotationX.to)
        },
        rotationY: {
          from: this._helper.getAnimationProperty(domElement, 'from-rotation-y', this._defaults.animation.rotationY.from),
          to: this._helper.getAnimationProperty(domElement, 'to-rotation-y', this._defaults.animation.rotationY.to)
        },
        skewX: {
          from: this._helper.getAnimationProperty(domElement, 'from-skew-x', this._defaults.animation.skewX.from),
          to: this._helper.getAnimationProperty(domElement, 'to-skew-x', this._defaults.animation.skewX.to)
        },
        skewY: {
          from: this._helper.getAnimationProperty(domElement, 'from-skew-y', this._defaults.animation.skewY.from),
          to: this._helper.getAnimationProperty(domElement, 'to-skew-y', this._defaults.animation.skewY.to)
        },
        width: {
          from: this._helper.getAnimationProperty(domElement, 'from-width', this._defaults.animation.width.from),
          to: this._helper.getAnimationProperty(domElement, 'to-width', this._defaults.animation.width.to)
        },
        height: {
          from: this._helper.getAnimationProperty(domElement, 'from-height', this._defaults.animation.height.from),
          to: this._helper.getAnimationProperty(domElement, 'to-height', this._defaults.animation.height.to)
        }
      };

      // Can be set by data-* attributes ONLY
      const delay = eval(this._helper.getAnimationProperty(domElement, 'delay', this._defaults.animation.delay));
      const label = this._helper.getAnimationProperty(domElement, 'label', this._defaults.animation.label);

      // Can be set by data-* attribute AND modified by registered animation
      let transition = this._helper.getAnimationProperty(domElement, 'transition', this._defaults.animation.transition);
      let position = this._helper.getAnimationProperty(domElement, 'position', this._defaults.animation.position);

      // Can be set by data-* attribute OR registered animation
      let fromProps, toProps, extraProps, duration, stagger;

      // Retrieve registered animation
      if (animation) {
        if (!this._animations[animation]) {
          console.error(`[ScrollView] Can\'t find animation "${animation}". You need to register it.`);
          return;
        }

        fromProps = this._animations[animation].from;
        toProps = this._animations[animation].to;
        extraProps = {
          ease: this._animations[animation].ease,
          repeat: this._animations[animation].repeat,
          yoyo: this._animations[animation].yoyo,
          transformOrigin: this._animations[animation].transformOrigin
        };
        duration = this._animations[animation].duration;
        stagger = this._animations[animation].stagger;
        transition = this._animations[animation].transition || transition;
        position = this._animations[animation].position || position;
      }
      // Build animation from DOM attributes
      else {
        fromProps = this._buildState('from', animationProps);
        toProps = this._buildState('to', animationProps);
        extraProps = {
          ease: eval(this._helper.getAnimationProperty(domElement, 'ease', this._defaults.animation.ease)),
          repeat: eval(this._helper.getAnimationProperty(domElement, 'repeat', this._defaults.animation.repeat)),
          yoyo: eval(this._helper.getAnimationProperty(domElement, 'yoyo', this._defaults.animation.yoyo)),
          transformOrigin: this._helper.getAnimationProperty(domElement, 'transform-origin', this._defaults.animation.transformOrigin)
        };
        duration = this._helper.getAnimationProperty(domElement, 'duration', this._defaults.animation.duration);
        stagger = this._helper.getAnimationProperty(domElement, 'stagger', this._defaults.animation.stagger);
      }

      if (delay) {
        tween.delay(delay);
      }

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

      if (modifier.triggerHook !== undefined) {
        scene.triggerHook(modifier.triggerHook);
      }

      if (modifier.onEnter !== undefined) {
        scene.on('enter', modifier.onEnter);
      }

      if (modifier.onProgress !== undefined) {
        scene.on('progress', modifier.onProgress);
      }

      if (modifier.offset !== undefined) {
        scene.offset(modifier.offset);
      }

      if (modifier.pin !== undefined) {
        scene.setPin(modifier.pin);
      }

      if (modifier.reverse !== undefined) {
        scene.reverse(modifier.reverse);
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
      .on('update', e => {
        if (during) {
          const progress = (function () {
            const p = (e.scrollPos - e.startPos)/(e.endPos - e.startPos);
            return p < 0 ? 0 : (p > 1 ? 1 : p);
          })();

          const delta = scene.duration() * progress;

          this._updateParallaxItems([item], delta);
        }
      })
      .on('enter', () => during = true)
      .on('leave', () => during = false);

      if (item.indicator) {
        scene.addIndicators({ name: item.indicator });
      }

      this._domElements.push(item.domElement);
  
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

    // TODO: Check if it breaks anything when not using in parallax elements
    this._domElements.forEach(domElement => {
      TweenMax.killTweensOf(domElement);
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
