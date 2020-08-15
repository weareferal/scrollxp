import ParamHelper from "../helpers/param.helper"
import Logger from "../scrollmagic/utils/logger"
import TypeHelper from "../helpers/type.helper"
import { merge } from "../utils"

export default class ParallaxBuilder implements IBuilder<ParallaxDescriptor> {
  public static NAMESPACE = "ParallaxBuilder"

  private readonly descriptor: ParallaxDescriptor

  constructor(name?: string, defaultOptions?: ParallaxDescriptor) {
    if (name !== undefined && !ParamHelper.isString(name)) {
      throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Parallax name isn't a valid string: "${name}"`)
    }
    if (defaultOptions !== undefined && !TypeHelper.isParallaxDescriptor(defaultOptions)) {
      throw new TypeError(
        `[${ParallaxBuilder.NAMESPACE}] Parallax default options aren't a valid object: "${defaultOptions}"`,
      )
    }
    if (defaultOptions && defaultOptions.name) {
      throw new Error(`[${ParallaxBuilder.NAMESPACE}] It's not possible to set a default name.`)
    }
    this.descriptor = merge(
      {
        name: name,
        enabled: true,
        type: "global",
        speed: 1,
        momentum: 0.3,
        ease: "none",
        duration: "100%",
        hook: 0.5,
        offset: 0,
      },
      defaultOptions,
    )
  }

  public element(value?: ParamElement): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isHTMLElement(value)) {
        this.descriptor.element = ParamHelper.toHTMLElement(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "element" isn't a valid DOM element: "${value}"`)
      }
    }
    return this
  }

  public enabled(value?: ParamBoolean): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this.descriptor.enabled = ParamHelper.toBoolean(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "enabled" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public type(value?: ParamString): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        if (value === "global" || value === "scene") {
          this.descriptor.type = ParamHelper.toString(value)
        } else {
          throw new Error(
            `[${ParallaxBuilder.NAMESPACE}] Value for "type" isn't valid, it should be "global" or "scene": "${value}"`,
          )
        }
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "type" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public speed(value?: ParamNumber): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this.descriptor.speed = ParamHelper.toInteger(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "speed" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public momentum(value?: ParamNumber): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this.descriptor.momentum = ParamHelper.toFloat(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "momentum" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public stagger(value?: ParamNumber): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this.descriptor.stagger = ParamHelper.toFloat(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "stagger" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public ease(value?: ParamString): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this.descriptor.ease = ParamHelper.toString(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "ease" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public trigger(value?: ParamSelector, container?: ParamElement): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isHTMLElement(value)) {
        this.descriptor.trigger = ParamHelper.toHTMLElement(value)
      } else if (ParamHelper.isString(value)) {
        if (container !== undefined && ParamHelper.isHTMLElement(container)) {
          const nodes = container.querySelectorAll(ParamHelper.toString(value))
          if (nodes.length === 1) {
            this.descriptor.trigger = ParamHelper.toHTMLElement(nodes[0])
          } else if (nodes.length > 1) {
            Logger.log(
              1,
              `[${ParallaxBuilder.NAMESPACE}] There are more than 1 element for trigger "${value}" in the given container. Using the first one.`,
            )
          } else {
            throw new Error(
              `[${ParallaxBuilder.NAMESPACE}] Could't find an element with query "${value}" in the given container.`,
            )
          }
        } else {
          const nodes = document.body.querySelectorAll(ParamHelper.toString(value))
          if (nodes.length === 1) {
            this.descriptor.trigger = ParamHelper.toHTMLElement(nodes[0])
          } else if (nodes.length > 1) {
            Logger.log(
              1,
              `[${ParallaxBuilder.NAMESPACE}] There are more than 1 element for trigger "${value}" in the body. Using the first one.`,
            )
          } else {
            throw new Error(`[${ParallaxBuilder.NAMESPACE}] Could't find an element with query "${value}" in the body.`)
          }
        }
      } else {
        throw new TypeError(
          `[${ParallaxBuilder.NAMESPACE}] Value for "trigger" isn't a valid element or selector: "${value}"`,
        )
      }
    }
    return this
  }

  public duration(value?: ParamDuration): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this.descriptor.duration = ParamHelper.toInteger(value)
      } else if (ParamHelper.isPercentage(value)) {
        this.descriptor.duration = ParamHelper.toString(value)
      } else if (ParamHelper.isFunction(value)) {
        const durationMethod = <ParamCallback>value
        if (durationMethod && ParamHelper.isNumber(durationMethod())) {
          this.descriptor.duration = durationMethod
        } else {
          throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Function for "duration" should return a number.`)
        }
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "duration" isn't valid: "${value}"`)
      }
    }
    return this
  }

  public hook(value?: ParamNumber): ParallaxBuilder {
    if (value !== undefined) {
      if (!ParamHelper.isNumber(value) && ParamHelper.isString(value) && !ParamHelper.isHookValue(value)) {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "hook" isn't valid: "${value}"`)
      } else {
        if (ParamHelper.isString(value)) {
          value = ParamHelper.toHookValue(value)
        }
        if (ParamHelper.isNumber(value)) {
          if (value >= 0 && value <= 1) {
            this.descriptor.hook = ParamHelper.toFloat(value)
          } else {
            throw new RangeError(
              `[${ParallaxBuilder.NAMESPACE}] Value for "hook" should be between 0 and 1: "${value}"`,
            )
          }
        }
      }
    }
    return this
  }

  public offset(value?: ParamNumber): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this.descriptor.offset = ParamHelper.toInteger(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "offset" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public indicator(value?: ParamString): ParallaxBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this.descriptor.indicator = ParamHelper.toString(value)
      } else {
        throw new TypeError(`[${ParallaxBuilder.NAMESPACE}] Value for "indicator" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public build(): ParallaxDescriptor {
    return this.descriptor
  }
}
