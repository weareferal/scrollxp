import { component } from '../decorators';
import { findComponent } from '../utils';
import ScrollContainer from './scroll-container';


@component('toggleButton')
class ToggleButton {
  constructor(element) {
    this.element = element;

    this.element.addEventListener('click', this.toggle.bind(this));
    this.updateState();
  }

  toggle() {
    const scrollContainer = findComponent(ScrollContainer);
    if (scrollContainer) {
      scrollContainer.toggleSmoothScrolling();
      this.updateState();
    }
  }

  updateState() {
    const scrollContainer = findComponent(ScrollContainer);
    if (scrollContainer) {
      const hasSmoothScrolling = scrollContainer.hasSmoothScrolling();
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
