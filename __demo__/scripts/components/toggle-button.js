import { component } from '../decorators';
import { findComponent } from '../utils';
import ScrollContainer from './scroll-container';


@component('toggleButton')
class ToggleButton {
  constructor(element) {
    this.element = element;

    const scrollContainer = findComponent(ScrollContainer);
    if (scrollContainer) {
      this._isActive = scrollContainer.smoothScrolling();

      this.element.addEventListener('click', () => {
        this._isActive = !this._isActive;

        scrollContainer.smoothScrolling(this._isActive);

        this._updateState();
      });

      this._updateState();
    } else {
      console.error('[ToggleButton] Couldn\'t find ScrollContainer component.');
    }
  }

  _updateState() {
    if (this._isActive) {
      this.element.querySelector('span').innerText = 'On';
      this.element.querySelector('span').classList.remove('off');
      this.element.querySelector('span').classList.add('on');
    } else {
      this.element.querySelector('span').innerText = 'Off';
      this.element.querySelector('span').classList.remove('on');
      this.element.querySelector('span').classList.add('off');
    }
  }
};

export default ToggleButton;
