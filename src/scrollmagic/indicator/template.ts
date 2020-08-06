import domUtils from "../utils/dom"
import Indicator from "."

export default {
  start(color: string): HTMLElement {
    // Inner element (for bottom offset -1, while keeping top position 0)
    const inner = document.createElement("div")
    inner.textContent = "start"
    domUtils.css(inner, {
      position: "absolute",
      overflow: "visible",
      "border-width": 0,
      "border-style": "solid",
      color: color,
      "border-color": color,
    })

    // Wrapper
    const elem = document.createElement("div")
    domUtils.css(elem, {
      position: "absolute",
      overflow: "visible",
      width: 0,
      height: 0,
    })
    elem.appendChild(inner)

    return elem
  },
  end(color: string): HTMLElement {
    const elem = document.createElement("div")
    elem.textContent = "end"
    domUtils.css(elem, {
      position: "absolute",
      overflow: "visible",
      "border-width": 0,
      "border-style": "solid",
      color: color,
      "border-color": color,
    })
    return elem
  },
  bounds(): HTMLElement {
    const elem = document.createElement("div")
    domUtils.css(elem, {
      position: "absolute",
      overflow: "visible",
      "white-space": "nowrap",
      "pointer-events": "none",
      "font-size": Indicator.FONT_SIZE,
    })
    elem.style.zIndex = Indicator.ZINDEX
    return elem
  },
  trigger(color: string): HTMLElement {
    // Inner to be above or below line but keep position
    const inner = document.createElement("div")
    inner.textContent = "trigger"
    domUtils.css(inner, {
      position: "relative",
    })

    // Inner wrapper for right: 0 and main element has no size
    const wrapper = document.createElement("div")
    domUtils.css(wrapper, {
      position: "absolute",
      overflow: "visible",
      "border-width": 0,
      "border-style": "solid",
      color: color,
      "border-color": color,
    })
    wrapper.appendChild(inner)

    // Wrapper
    const elem = document.createElement("div")
    domUtils.css(elem, {
      position: "fixed",
      overflow: "visible",
      "white-space": "nowrap",
      "pointer-events": "none",
      "font-size": Indicator.FONT_SIZE,
    })
    elem.style.zIndex = Indicator.ZINDEX
    elem.appendChild(wrapper)

    return elem
  },
}
