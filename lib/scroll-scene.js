import ScrollMagic from 'scrollmagic';


/**
 * ScrollScene
 * 
 * This is a wrapper for ScrollMagic scene class. It makes scene work with smooth scrolling.
 * 
 * @param {*} options
 */
class ScrollScene {
  constructor(options) {
    this._options = options;

    this._controller = null;

    this._pinnedElement = null;
    this._pinnedEnterListener = null;
    this._pinnedLeaveListener = null;
    this._pinnedScrollListener = null;

    this._scene = new ScrollMagic.Scene(this._options);

    return this;
  }

  setTween(tween, duration, params) {
    if (arguments.length > 1) {
      if (arguments.length < 3) {
        params = duration;
        duration = 1;
      }
      tween = TweenMax.to(tween, duration, params);
    }
    this._scene.setTween(tween);
    return this;
  }

  setClassToggle(element, classes) {
    this._scene.setClassToggle(element, classes);
    return this;
  }

  setPin(element) {
    this._pinnedElement = element;
    return this;
  }

  removePin(reset) {
    this._scene.removePin(reset);
    return this;
  }

  on(names, callback) {
    this._scene.on(names, callback);
    return this;
  }

  addIndicators(options) {
    this._scene.addIndicators(options);
    return this;
  }

  addTo(controller) {
    this._controller = controller;

    if (this._pinnedElement) {
      /**
       * Workaround
       * 
       * Only in the case we're using smooth scrolling.
       * 
       * Since transform creates a new local coordinate system, position: fixed is fixed to the origin
       * of scrollbar content container, i.e. the left: 0, top: 0 point.
       * 
       * Therefore, we need to apply offsets to make it work properly.
       * https://github.com/idiotWu/smooth-scrollbar/issues/49#issuecomment-265358197
       */
      if (this._controller.smoothScrolling()) {
        let elementPosY = 0;

        this._pinnedScrollListener = ({ offset }) => {
          if (elementPosY === 0) {
            const elementOffsetY = this._pinnedElement.getBoundingClientRect().top;
            const triggerOffsetY = this._scene.triggerElement().getBoundingClientRect().top;
            const triggerPosY = this._scene.duration() * this._scene.triggerHook();

            elementPosY = elementOffsetY - triggerOffsetY + triggerPosY;
          }

          const scrollPosY = offset.y;

          const top = elementPosY + scrollPosY;
          const width = parseInt(this._pinnedElement.getBoundingClientRect().width);

          this._pinnedElement.style.position = 'fixed';
          this._pinnedElement.style.top = `${top}px`;
          this._pinnedElement.style.width = `${width}px`;
        };

        this._pinnedEnterListener = () => this._controller.addScrollbarListener(this._pinnedScrollListener);
        this._pinnedLeaveListener = () => this._controller.removeScrollbarListener(this._pinnedScrollListener);

        this._scene.on('enter', this._pinnedEnterListener);
        this._scene.on('leave', this._pinnedLeaveListener);
      } else {
        this._scene.setPin(this._pinnedElement);
      }
    }

    this._scene.addTo(controller.controller());
    return this;
  }

  remove() {
    this._scene.remove();

    /**
     * Workaround
     * 
     * Only in the case we're using smooth scrolling.
     * 
     * Since we're adding listeners to emulate the same pin feature that ScrollMagic has, when removing the scene,
     * we need to remove these listeners and reset the element position.
     */
    if (this._pinnedElement && this._controller && this._controller.smoothScrolling()) {
      this._scene.off('enter', this._pinnedEnterListener);
      this._scene.off('leave', this._pinnedLeaveListener);

      this._controller.removeScrollbarListener(this._pinnedScrollListener);

      this._pinnedElement.style.position = null;
      this._pinnedElement.style.top = null;
      this._pinnedElement.style.width = null;
    }

    this._controller = null;

    return this;
  }

  triggerElement(newTriggerElement) {
    if (!arguments.length) {
      return this._scene.triggerElement();
    }
    this._scene.triggerElement(newTriggerElement);
    return this;
  }

  triggerHook(newTriggerHook) {
    if (!arguments.length) {
      return this._scene.triggerHook();
    }
    this._scene.triggerHook(newTriggerHook);
    return this;
  }

  duration(newDuration) {
    if (!arguments.length) {
      return this._scene.duration();
    }
    this._scene.duration(newDuration);
    return this;
  }

  progress(newProgress) {
    if (!arguments.length) {
      return this._scene.progress();
    }
    this._scene.progress(newProgress);
    return this;
  }

  offset(newOffset) {
    if (!arguments.length) {
      return this._scene.offset();
    }
    this._scene.offset(newOffset);
    return this;
  }

  reverse(newReverse) {
    if (!arguments.length) {
      return this._scene.reverse();
    }
    this._scene.reverse(newReverse);
    return this;
  }

  refresh() {
    this._scene.refresh();
    return this;
  }
};

export default ScrollScene;
