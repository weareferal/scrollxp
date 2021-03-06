import ParamHelper from "../helpers/param.helper"
import Logger from "../scrollmagic/utils/logger"
import TypeHelper from "../helpers/type.helper"
import { merge } from "../utils"
import {
  IBuilder,
  SceneDescriptor,
  SceneDescriptorCallback,
  ParamString,
  ParamBoolean,
  ParamNumber,
  ParamElement,
  ParamDuration,
  ParamSelector,
  ParamCallback,
} from "../interfaces"

export default class SceneBuilder implements IBuilder<SceneDescriptor> {
  public static NAMESPACE = "SceneBuilder"

  private readonly descriptor: SceneDescriptor

  constructor(name?: string, defaultOptions?: SceneDescriptor) {
    if (name !== undefined && !ParamHelper.isString(name)) {
      throw new TypeError(`[${SceneBuilder.NAMESPACE}] Scene name isn't a valid string: "${name}"`)
    }
    if (defaultOptions !== undefined && !TypeHelper.isSceneDescriptor(defaultOptions)) {
      throw new TypeError(`[${SceneBuilder.NAMESPACE}] Scene default options aren't a valid object.`)
    }
    if (defaultOptions && defaultOptions.name) {
      throw new Error(`[${SceneBuilder.NAMESPACE}] It's not possible to set a default name.`)
    }
    this.descriptor = merge(
      {
        name: name,
        enabled: true,
        duration: 0,
        hook: 0.5,
        reverse: true,
        pin: false,
      },
      defaultOptions,
    )
  }

  public enabled(value?: ParamBoolean): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this.descriptor.enabled = ParamHelper.toBoolean(value)
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "enabled" isn't a valid boolean: "${value}"`)
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
            Logger.warning(
              `[${SceneBuilder.NAMESPACE}] There are more than 1 element for trigger "${value}" in the given container. Using the first one.`,
            )
          } else {
            throw new Error(
              `[${SceneBuilder.NAMESPACE}] Could't find an element with query "${value}" in the given container.`,
            )
          }
        } else {
          const nodes = document.body.querySelectorAll(ParamHelper.toString(value))
          if (nodes.length === 1) {
            this.descriptor.trigger = ParamHelper.toHTMLElement(nodes[0])
          } else if (nodes.length > 1) {
            Logger.warning(
              `[${SceneBuilder.NAMESPACE}] There are more than 1 element for trigger "${value}" in the body. Using the first one.`,
            )
          } else {
            throw new Error(`[${SceneBuilder.NAMESPACE}] Could't find an element with query "${value}" in the body.`)
          }
        }
      } else {
        throw new TypeError(
          `[${SceneBuilder.NAMESPACE}] Value for "trigger" isn't a valid element or selector: "${value}"`,
        )
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
          throw new TypeError(`[${SceneBuilder.NAMESPACE}] Function for "duration" should return a number.`)
        }
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "duration" isn't valid: "${value}"`)
      }
    }
    return this
  }

  public hook(value?: ParamNumber): SceneBuilder {
    if (value !== undefined) {
      if (!ParamHelper.isNumber(value) && ParamHelper.isString(value) && !ParamHelper.isHookValue(value)) {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "hook" isn't valid: "${value}"`)
      } else {
        if (ParamHelper.isString(value)) {
          value = ParamHelper.toHookValue(value)
        }
        if (ParamHelper.isNumber(value)) {
          if (value >= 0 && value <= 1) {
            this.descriptor.hook = ParamHelper.toFloat(value)
          } else {
            throw new RangeError(`[${SceneBuilder.NAMESPACE}] Value for "hook" should be between 0 and 1: "${value}"`)
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
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "reverse" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public pin(value?: ParamBoolean): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this.descriptor.pin = ParamHelper.toBoolean(value)
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "pin" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public classToggle(value?: ParamString): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this.descriptor.classToggle = ParamHelper.toString(value)
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "classToggle" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public indicator(value?: ParamString): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this.descriptor.indicator = ParamHelper.toString(value)
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "indicator" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public onEnter(value?: SceneDescriptorCallback): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isFunction(value)) {
        this.descriptor.onEnter = <SceneDescriptorCallback>value
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "onEnter" isn't a valid function: "${value}"`)
      }
    }
    return this
  }

  public onLeave(value?: SceneDescriptorCallback): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isFunction(value)) {
        this.descriptor.onLeave = <SceneDescriptorCallback>value
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "onLeave" isn't a valid function: "${value}"`)
      }
    }
    return this
  }

  public onProgress(value?: SceneDescriptorCallback): SceneBuilder {
    if (value !== undefined) {
      if (ParamHelper.isFunction(value)) {
        this.descriptor.onProgress = <SceneDescriptorCallback>value
      } else {
        throw new TypeError(`[${SceneBuilder.NAMESPACE}] Value for "onProgress" isn't a valid function: "${value}"`)
      }
    }
    return this
  }

  public build(): SceneDescriptor {
    return this.descriptor
  }
}
