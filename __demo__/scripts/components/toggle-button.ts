import { findComponent } from '../utils'
import ScrollContainer from './scroll-container'
import Component from "../component"


class ToggleButton extends Component  {
  public static componentName = "toggleButton"

  private isActive: boolean

  constructor(element, options?) {
    super(element, options)

    this.element = element

    const scrollContainer = findComponent(ScrollContainer)
    if (scrollContainer) {
      this.isActive = scrollContainer.smoothScrolling()

      this.element.addEventListener('click', () => {
        this.isActive = !this.isActive;

        scrollContainer.smoothScrolling(this.isActive)

        this.updateState()
      });

      this.updateState()
    } else {
      console.error('[ToggleButton] Couldn\'t find ScrollContainer component.')
    }
  }

  private updateState(): void {
    const span = this.element.querySelector('span')
    if (span) {
      if (this.isActive) {
        span.innerText = 'On'
        span.classList.remove('off')
        span.classList.add('on')
      } else {
        span.innerText = 'Off'
        span.classList.remove('on')
        span.classList.add('off')
      }
    }
  }
};

export default ToggleButton
