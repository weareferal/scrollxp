/* eslint-disable */

import { ParamString, Breakpoints } from "../interfaces";

function type(value: any): string {
  return Object.prototype.toString
    .call(value)
    .replace(/^\[object (.+)\]$/, "$1")
    .toLowerCase()
}

/**
 * Check if value is string.
 *
 * @example
 * isString("bla") // true
 * isString("12") // false
 * isString("true") // false
 *
 * @param {any} - Value from parameter
 *
 * @returns {boolean}
 */
function isString(value: any): boolean {
  return type(value) === "string" && !isNumber(value) && !isBoolean(value)
}

function isNumber(value: any): boolean {
  return !isArray(value) && value - parseFloat(value) + 1 >= 0
}

function isPercentage(value: any): boolean {
  return type(value) === "string" && value.match(/^(\.|\d)*\d+%$/)
}

function isBoolean(value: any): boolean {
  return (
    type(value) === "boolean" ||
    (type(value) === "string" && (value.toLowerCase() === "true" || value.toLowerCase() === "false"))
  )
}

function isArray(value: any): boolean {
  return Array.isArray(value)
}

function isFunction(value: any): boolean {
  return type(value) === "function"
}

function isHookValue(value: any): boolean {
  return value === "onLeave" || value === "onCenter" || value === "onEnter"
}

function isHTMLElement(value: any): boolean {
  return typeof HTMLElement === "object" || typeof HTMLElement === "function"
    ? value instanceof HTMLElement || (typeof SVGElement !== "undefined" && value instanceof SVGElement)
    : value &&
        typeof value === "object" &&
        value !== null &&
        value.nodeType === 1 &&
        typeof value.nodeName === "string"
}

function toString(value: any): string {
  return `${value}`
}

function toFloat(value: any): number {
  return parseFloat(toString(value))
}

function toInteger(value: any): number {
  return parseInt(toString(value))
}

function toBoolean(value: any): boolean {
  return toString(value).toLowerCase() === "true" ? true : false
}

function toHookValue(value: any): number {
  const values = {
    onLeave: 0,
    onCenter: 0.5,
    onEnter: 1,
  }
  if (value in values) {
    return values[value]
  }
  return -1
}

function toHTMLElement(value: any): HTMLElement {
  return <HTMLElement>value
}

// TODO: Improve this to be independent from breakpoints, maybe using a recursive function
function get(item: HTMLElement, breakpoints: Breakpoints, type: string, property: string): ParamString {
  const screenWidth = window.innerWidth

  const key = property === "name" ? type : `${type}-${property}`

  // xs
  if (breakpoints.sm && screenWidth < breakpoints.sm) {
    return item.getAttribute(`data-xs-${key}`) || item.getAttribute(`data-${key}`) || undefined
  }
  // sm
  else if (breakpoints.md && screenWidth < breakpoints.md) {
    return (
      item.getAttribute(`data-sm-${key}`) ||
      item.getAttribute(`data-xs-${key}`) ||
      item.getAttribute(`data-${key}`) ||
      undefined
    )
  }
  // md
  else if (breakpoints.lg && screenWidth < breakpoints.lg) {
    return (
      item.getAttribute(`data-md-${key}`) ||
      item.getAttribute(`data-sm-${key}`) ||
      item.getAttribute(`data-xs-${key}`) ||
      item.getAttribute(`data-${key}`) ||
      undefined
    )
  }
  // lg
  else if (breakpoints.xl && screenWidth < breakpoints.xl) {
    return (
      item.getAttribute(`data-lg-${key}`) ||
      item.getAttribute(`data-md-${key}`) ||
      item.getAttribute(`data-sm-${key}`) ||
      item.getAttribute(`data-xs-${key}`) ||
      item.getAttribute(`data-${key}`) ||
      undefined
    )
  }
  // xl
  else if (breakpoints.xxl && screenWidth < breakpoints.xxl) {
    return (
      item.getAttribute(`data-xl-${key}`) ||
      item.getAttribute(`data-lg-${key}`) ||
      item.getAttribute(`data-md-${key}`) ||
      item.getAttribute(`data-sm-${key}`) ||
      item.getAttribute(`data-xs-${key}`) ||
      item.getAttribute(`data-${key}`) ||
      undefined
    )
  }
  // xxl
  else {
    return (
      item.getAttribute(`data-xxl-${key}`) ||
      item.getAttribute(`data-xl-${key}`) ||
      item.getAttribute(`data-lg-${key}`) ||
      item.getAttribute(`data-md-${key}`) ||
      item.getAttribute(`data-sm-${key}`) ||
      item.getAttribute(`data-xs-${key}`) ||
      item.getAttribute(`data-${key}`) ||
      undefined
    )
  }
}

export default {
  isString,
  isNumber,
  isPercentage,
  isBoolean,
  isFunction,
  isHookValue,
  isHTMLElement,
  toString,
  toInteger,
  toFloat,
  toBoolean,
  toHookValue,
  toHTMLElement,
  get,
}
