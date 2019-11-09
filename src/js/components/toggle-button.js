import { component } from '../decorators';
import { findComponent } from '../utils';
import ScrollController from './scroll-controller';


@component('toggleButton')
class ToggleButton {
  constructor(element) {
    this.element = element;

    this.element.addEventListener('click', this.toggle.bind(this));
    this.updateState();
  }

  toggle() {
    const scrollController = findComponent(ScrollController);
    if (scrollController) {
      scrollController.toggleSmoothScrolling();
      this.updateState();
    }
  }

  updateState() {
    const scrollController = findComponent(ScrollController);
    if (scrollController) {
      const hasSmoothScrolling = scrollController.hasSmoothScrolling();
      if (hasSmoothScrolling) {
        this.element.querySelector('span').innerText = 'On';
        this.element.querySelector('span').classList.remove('off');
        this.element.querySelector('span').classList.add('on');
      } else {
        this.element.querySelector('span').innerText = 'Off';
        this.element.querySelector('span').classList.remove('on');
        this.element.querySelector('span').classList.add('off');
      }
    }
  }
};

export default ToggleButton;
