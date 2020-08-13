import ParamHelper from "../helpers/param.helper"

export default class SceneBuilder implements IBuilder<SceneDescriptor> {
  public static NAMESPACE = "SceneBuilder"

  private readonly _descriptor: SceneDescriptor

  constructor(name?: string) {
    this._descriptor = {
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
        this._descriptor.enabled = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "enabled" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public duration(value?: ParamDuration): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.duration = ParamHelper.toInteger(value)
      } else if (ParamHelper.isPercentage(value)) {
        this._descriptor.duration = ParamHelper.toString(value)
      } else if (ParamHelper.isFunction(value)) {
        if (ParamHelper.isNumber(value())) {
          this._descriptor.duration = value
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
            this._descriptor.hook = ParamHelper.toFloat(value)
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
        this._descriptor.reverse = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "reverse" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public pin(value?: ParamBoolean): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this._descriptor.pin = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "pin" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public classToggle(value?: ParamString): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this._descriptor.classToggle = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "classToggle" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public indicator(value?: ParamString): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this._descriptor.indicator = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${SceneBuilder.NAMESPACE}] Value for "indicator" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public build(): SceneDescriptor {
    return this._descriptor
  }
}
