import ScrollMagic from 'scrollmagic';


class Scene {
  constructor(options) {
    this.options = options;

    this.controller = null;

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
    this.scene.addTo(controller.controller);
    return this;
  }

  remove() {
    this.scene.remove();
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
    this.scene.duration(newDuration);
    return this;
  }

  refresh() {
    this.scene.refresh();
    return this;
  }
};

export default Scene;
