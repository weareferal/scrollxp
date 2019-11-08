import { component } from '../decorators';
import { findComponent } from '../utils';
import ScrollController from './scroll-controller';


@component('toggleButton')
class ToggleButton {
  constructor(element) {
    element.addEventListener('click', () => {
      const hasSmoothScrolling = findComponent(ScrollController).toggleSmoothScrolling();
      if (hasSmoothScrolling) {
        element.querySelector('span').innerText = 'On';
        element.querySelector('span').classList.remove('off');
        element.querySelector('span').classList.add('on');
      } else {
        element.querySelector('span').innerText = 'Off';
        element.querySelector('span').classList.remove('on');
        element.querySelector('span').classList.add('off');
      }
    });
  }
};

export default ToggleButton;
