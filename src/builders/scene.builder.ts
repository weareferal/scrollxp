import ParamHelper from "../helpers/param.helper"
import Logger from "../scrollmagic/utils/logger"

export default class SceneBuilder implements IBuilder<SceneDescriptor> {
  public static NAMESPACE = "SceneBuilder"

  private readonly descriptor: SceneDescriptor

  constructor(name?: string) {
    this.descriptor = {
      name: name,
      enabled: true,
      duration: 0,
      hook: 0.5,
      reverse: true,
      pin: false,
    }
  }

  public enabled(value?: ParamBoolean): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this.descriptor.enabled = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "enabled" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public trigger(value?: ParamSelector, container?: ParamElement): SceneBuilder {
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
              `[${SceneBuilder.NAMESPACE}] There are more than 1 element for trigger "${value}" in the given container. Using the first one.`,
            )
          } else {
            throw Error(
              `[${SceneBuilder.NAMESPACE}] Could't find an element with query "${value}" in the given container.`,
            )
          }
        } else {
          const nodes = document.body.querySelectorAll(ParamHelper.toString(value))
          if (nodes.length === 1) {
            this.descriptor.trigger = ParamHelper.toHTMLElement(nodes[0])
          } else if (nodes.length > 1) {
            Logger.log(
              1,
              `[${SceneBuilder.NAMESPACE}] There are more than 1 element for trigger "${value}" in the body. Using the first one.`,
            )
          } else {
            throw Error(`[${SceneBuilder.NAMESPACE}] Could't find an element with query "${value}" in the body.`)
          }
        }
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "trigger" isn't a valid element or selector: "${value}"`)
      }
    }
    return this
  }

  public duration(value?: ParamDuration): SceneBuilder {
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
          throw TypeError(`[${SceneBuilder.NAMESPACE}] Function for "duration" should return a number.`)
        }
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "duration" isn't valid: "${value}"`)
      }
    }
    return this
  }

  public hook(value?: ParamNumber): SceneBuilder {
    if (value !== undefined) {
      if (!ParamHelper.isNumber(value) && ParamHelper.isString(value) && !ParamHelper.isHookValue(value)) {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "hook" isn't valid: "${value}"`)
      } else {
        if (ParamHelper.isString(value)) {
          value = ParamHelper.toHookValue(value)
        }
        if (ParamHelper.isNumber(value)) {
          if (value >= 0 && value <= 1) {
            this.descriptor.hook = ParamHelper.toFloat(value)
          } else {
            throw RangeError(`[${SceneBuilder.NAMESPACE}] Value for "hook" should be between 0 and 1: "${value}"`)
          }
        }
      }
    }
    return this
  }

  public reverse(value?: ParamBoolean): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this.descriptor.reverse = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "reverse" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public pin(value?: ParamBoolean): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this.descriptor.pin = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "pin" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public classToggle(value?: ParamString): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this.descriptor.classToggle = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "classToggle" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public indicator(value?: ParamString): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this.descriptor.indicator = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "indicator" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public build(): SceneDescriptor {
    return this.descriptor
  }
}
