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
    const tagBackArrow = document.createElement("div")
    domUtils.css(tagBackArrow, {
      width: 0,
      height: 0,
      position: "absolute",
      left: "-3px",
      "z-index": -1,
    })

    const tagFrontArrow = document.createElement("div")
    domUtils.css(tagFrontArrow, {
      width: 0,
      height: 0,
      position: "relative",
      "z-index": 2,
    })

    const tagBlock = document.createElement("div")
    tagBlock.textContent = "trigger"
    domUtils.css(tagBlock, {
      "font-family": "Arial, sans-serif",
      "font-weight": "bold",
      "font-size": Indicator.FONT_SIZE,
      "line-height": Indicator.LINE_HEIGHT,
      "background-color": color,
      color: "#fff",
      border: "2px solid white",
      "box-shadow": "4px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
    })

    const tag = document.createElement("div")
    domUtils.css(tag, {
      position: "absolute",
      overflow: "visible",
      display: "flex",
    })
    tag.appendChild(tagBackArrow)
    tag.appendChild(tagFrontArrow)
    tag.appendChild(tagBlock)

    const elem = document.createElement("div")
    domUtils.css(elem, {
      position: "fixed",
      overflow: "visible",
      "white-space": "nowrap",
      "pointer-events": "none",
    })
    elem.style.zIndex = Indicator.ZINDEX
    elem.appendChild(tag)

    return elem
  },
}
