/* eslint-disable */

import TypeHelper from "./helpers/type.helper"
import { Breakpoints, BreakpointListenerResult } from "./interfaces";

/**
 * BreakpointListener
 *
 * Provide information when screen size changes from/to several breakpoints.
 *
 * @param {() => void} callback
 * @param {Breakpoints} breakpoints
 */
export class BreakpointListener {
  private screenSize: string
  private windowWidth: number = window.innerWidth
  private timeout: number
  private checkView: () => void
  private listener: () => void

  constructor(callback: (BreakpointListenerResult) => void, breakpoints: Breakpoints) {
    this.checkView = () => {
      const keys = Object.keys(breakpoints)

      let screenSize = keys.slice(-1)[0]

      for (let i = keys.length - 1; i >= 0; i--) {
        const value = breakpoints[keys[i]]
        if (this.windowWidth < value) {
          screenSize = keys[i - 1] || "xs"
        }
      }

      const hasChanged = this.screenSize !== screenSize

      this.screenSize = screenSize

      callback({
        screenSize: this.screenSize,
        hasChanged: hasChanged,
      })
    }

    this.listener = () => {
      if (this.windowWidth !== window.innerWidth) {
        this.windowWidth = window.innerWidth

        if (this.timeout) {
          window.clearTimeout(this.timeout)
        }

        this.timeout = window.setTimeout(this.checkView, 250)
      }
    }

    window.addEventListener("resize", this.listener)

    this.checkView()
  }
}

/**
 * Method to perform a deep merge of objects
 *
 * @param {Object} target - The targeted object that needs to be merged with the supplied @sources
 * @param {Array<Object>} sources - The source(s) that will be used to update the @target object
 *
 * @return {Object} The final merged object
 */
export function merge<O>(target: O, ...sources: Array<O | undefined>): O {
  // Return the target if no sources passed
  if (!sources.length) {
    return target
  }

  const result: O = target

  if (TypeHelper.isObject(result)) {
    const len: number = sources.length
    for (let i = 0; i < len; i += 1) {
      const elm: any = sources[i]
      if (TypeHelper.isObject(elm)) {
        for (const key in elm) {
          if (elm.hasOwnProperty(key)) {
            if (TypeHelper.isObject(elm[key])) {
              if (!result[key] || !TypeHelper.isObject(result[key])) {
                result[key] = {}
              }
              merge(result[key], elm[key])
            } else {
              if (Array.isArray(result[key]) && Array.isArray(elm[key])) {
                // Concatenate the two arrays and remove any duplicate primitive values
                result[key] = Array.from(new Set(result[key].concat(elm[key])))
              } else {
                result[key] = elm[key]
              }
            }
          }
        }
      }
    }
  }
  return result
}

/**
 * Method to erase properties of objects
 *
 * @param {Object} target - The targeted object that needs to be cleared
 * @param {Array<string>} properties - The properties that will be removed from the @target object
 *
 * @return {Object} The final cleared object
 */
export function clear<O>(target: O, ...properties: Array<string>): O {
  if (properties.length) {
    properties.forEach(property => {
      delete target[property]
    })
  }
  return target
}

