import domUtils from "../utils/dom"
import Indicator from "."

export default {
  start(color: string): HTMLElement {
    const tagBackArrow = document.createElement("div")
    domUtils.css(tagBackArrow, {
      width: 0,
      height: 0,
      position: "absolute",
      right: "-3px",
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
    tagBlock.textContent = "start"
    domUtils.css(tagBlock, {
      "font-family": "Arial, sans-serif",
      "font-weight": "bold",
      "font-size": Indicator.FONT_SIZE,
      "line-height": Indicator.LINE_HEIGHT,
      "background-color": "#fff",
      color: "currentColor",
      border: "2px solid white",
      "box-shadow": "4px 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
      "border-color": "currentColor",
    })

    const tag = document.createElement("div")
    domUtils.css(tag, {
      position: "absolute",
      overflow: "visible",
      display: "flex",
      color: color,
    })
    tag.appendChild(tagBlock)
    tag.appendChild(tagBackArrow)
    tag.appendChild(tagFrontArrow)

    const elem = document.createElement("div")
    domUtils.css(elem, {
      position: "absolute",
      overflow: "visible",
      width: 0,
      height: 0,
    })
    elem.appendChild(tag)

    return elem
  },
  end(color: string): HTMLElement {
    const tagBackArrow = document.createElement("div")
    domUtils.css(tagBackArrow, {
      width: 0,
      height: 0,
      position: "absolute",
      right: "-3px",
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
    tagBlock.textContent = "end"
    domUtils.css(tagBlock, {
      "font-family": "Arial, sans-serif",
      "font-weight": "bold",
      "font-size": Indicator.FONT_SIZE,
      "line-height": Indicator.LINE_HEIGHT,
      "background-color": "#fff",
      color: "currentColor",
      border: "2px solid white",
      "box-shadow": "4px 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
      "border-color": "currentColor",
    })

    const tag = document.createElement("div")
    domUtils.css(tag, {
      position: "absolute",
      overflow: "visible",
      display: "flex",
      color: color,
    })
    tag.appendChild(tagBlock)
    tag.appendChild(tagBackArrow)
    tag.appendChild(tagFrontArrow)

    const elem = document.createElement("div")
    domUtils.css(elem, {
      position: "absolute",
      overflow: "visible",
      width: 0,
      height: 0,
    })
    elem.appendChild(tag)
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
      color: color,
    })
    elem.style.zIndex = Indicator.ZINDEX
    elem.appendChild(tag)

    return elem
  },
}
