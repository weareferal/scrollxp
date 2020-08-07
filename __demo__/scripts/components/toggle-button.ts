import ScrollContainer from './scroll-container'
import { Component, component } from "../component"

@component("toggleButton")
class ToggleButton extends Component  {
  private isActive: boolean

  constructor(element, options?) {
    super(element, options)

    const scrollContainer = Component.find(ScrollContainer)
    if (scrollContainer) {
      this.isActive = scrollContainer.smoothScrolling()

      this.element.addEventListener("click", () => {
        this.isActive = !this.isActive;

        scrollContainer.smoothScrolling(this.isActive)

        this.updateState()
      })

      this.updateState()
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
