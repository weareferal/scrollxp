import ScrollMagic from 'scrollmagic';


class Scene {
  constructor(options) {
    this.options = options;

    this.controller = null;

    this.pinnedElement = null;
    this.pinnedEnterListener = null;
    this.pinnedLeaveListener = null;
    this.pinnedScrollListener = null;

    this.scene = new ScrollMagic.Scene(this.options);

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
    this.scene.setTween(tween);
    return this;
  }

  setClassToggle(element, classes) {
    this.scene.setClassToggle(element, classes);
    return this;
  }

  setPin(element) {
    this.pinnedElement = element;
    return this;
  }

  removePin(reset) {
    this.scene.removePin(reset);
    return this;
  }

  on(names, callback) {
    this.scene.on(names, callback);
    return this;
  }

  addIndicators(options) {
    this.scene.addIndicators(options);
    return this;
  }

  addTo(controller) {
    this.controller = controller;

    if (this.pinnedElement) {
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
      if (this.controller.hasSmoothScrolling()) {
        let elementPosY = 0;

        this.pinnedScrollListener = ({ offset }) => {
          if (elementPosY === 0) {
            const elementOffsetY = this.pinnedElement.getBoundingClientRect().top;
            const triggerOffsetY = this.scene.triggerElement().getBoundingClientRect().top;
            const triggerPosY = this.scene.duration() * this.scene.triggerHook();

            elementPosY = elementOffsetY - triggerOffsetY + triggerPosY;
          }

          const scrollPosY = offset.y;

          const top = elementPosY + scrollPosY;
          const width = parseInt(this.pinnedElement.getBoundingClientRect().width);

          this.pinnedElement.style.position = 'fixed';
          this.pinnedElement.style.top = `${top}px`;
          this.pinnedElement.style.width = `${width}px`;
        };

        this.pinnedEnterListener = () => this.controller.addScrollbarListener(this.pinnedScrollListener);
        this.pinnedLeaveListener = () => this.controller.removeScrollbarListener(this.pinnedScrollListener);

        this.scene.on('enter', this.pinnedEnterListener);
        this.scene.on('leave', this.pinnedLeaveListener);
      } else {
        this.scene.setPin(this.pinnedElement);
      }
    }

    this.scene.addTo(controller.controller);
    return this;
  }

  remove() {
    this.scene.remove();

    /**
     * Workaround
     * 
     * Only in the case we're using smooth scrolling.
     * 
     * Since we're adding listeners to emulate the same pin feature that ScrollMagic has, when removing the scene,
     * we need to remove these listeners and reset the element position.
     */
    if (this.pinnedElement && this.controller && this.controller.hasSmoothScrolling()) {
      this.scene.off('enter', this.pinnedEnterListener);
      this.scene.off('leave', this.pinnedLeaveListener);

      this.controller.removeScrollbarListener(this.pinnedScrollListener);

      this.pinnedElement.style.position = null;
      this.pinnedElement.style.top = null;
      this.pinnedElement.style.width = null;
    }

    this.controller = null;

    return this;
  }

  triggerElement(newTriggerElement) {
    if (arguments.length === 0) {
      return this.scene.triggerElement();
    }
    this.scene.triggerElement(newTriggerElement);
    return this;
  }

  triggerHook(newTriggerHook) {
    if (arguments.length === 0) {
      return this.scene.triggerHook();
    }
    this.scene.triggerHook(newTriggerHook);
    return this;
  }

  duration(newDuration) {
    if (arguments.length === 0) {
      return this.scene.duration();
    }
    this.scene.duration(newDuration);
    return this;
  }

  progress(newProgress) {
    if (arguments.length === 0) {
      return this.scene.progress();
    }
    this.scene.progress(newProgress);
    return this;
  }

  refresh() {
    this.scene.refresh();
    return this;
  }
};

export default Scene;
