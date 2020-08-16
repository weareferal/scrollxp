/* eslint-disable */

function type(value: any): string {
  return Object.prototype.toString
    .call(value)
    .replace(/^\[object (.+)\]$/, "$1")
    .toLowerCase()
}

export default {
  isString(value: any): boolean {
    return type(value) === "string"
  },
  isFunction(value: any): boolean {
    return type(value) === "function"
  },
  isArray(value: any): boolean {
    return Array.isArray(value)
  },
  isNumber(value: any): boolean {
    return !this.isArray(value) && value - parseFloat(value) + 1 >= 0
  },
  isDomElement(value: any): boolean {
    return typeof HTMLElement === "object" || typeof HTMLElement === "function"
      ? value instanceof HTMLElement || (typeof SVGElement !== "undefined" && value instanceof SVGElement)
      : value &&
          typeof value === "object" &&
          value !== null &&
          value.nodeType === 1 &&
          typeof value.nodeName === "string"
  },
  isNodeList(value: any): boolean {
    return type(value) === "nodelist"
  },
  /**
   * Method to check if an item is an object. Date and Function are considered
   * an object, so if you need to exclude those, please update the method accordingly.
   *
   * @param item - The item that needs to be checked
   *
   * @return {boolean} Whether or not @item is an object
   */
  isObject(value: any): boolean {
    return value === Object(value) && !Array.isArray(value) && !this.isDomElement(value) && !this.isFunction(value)
  },
  isAnimationDescriptor(obj: any): obj is AnimationDescriptor {
    return obj.yoyo !== undefined
  },
  isSceneDescriptor(obj: any): obj is SceneDescriptor {
    return obj.hook !== undefined && obj.speed === undefined
  },
  isParallaxDescriptor(obj: any): obj is ParallaxDescriptor {
    return obj.hook !== undefined && obj.speed !== undefined
  }
}
