import ParamHelper from "../helpers/param.helper"

export default class AnimationBuilder implements IBuilder<AnimationDescriptor> {
  public static NAMESPACE = "AnimationBuilder"

  private readonly _descriptor: AnimationDescriptor

  constructor(name?: string) {
    this._descriptor = {
      name: name,
      duration: 1,
      position: "+=0",
      repeat: 0,
      yoyo: false,
      delay: 0,
      ease: "power1.out",
      momentum: 0,
      transformOrigin: "center center",
      from: {},
      to: {},
    }
  }

  public duration(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.duration = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "duration" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public position(value?: ParamString): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this._descriptor.position = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "position" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public repeat(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.repeat = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "repeat" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public yoyo(value?: ParamBoolean): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isBoolean(value)) {
        this._descriptor.yoyo = ParamHelper.toBoolean(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "yoyo" isn't a valid boolean: "${value}"`)
      }
    }
    return this
  }

  public delay(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.delay = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "delay" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public momentum(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.momentum = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "momentum" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public stagger(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.stagger = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "stagger" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public transformOrigin(value?: ParamString): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this._descriptor.transformOrigin = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "transformOrigin" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public ease(value?: ParamString): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this._descriptor.ease = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "ease" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public label(value?: ParamString): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isString(value)) {
        this._descriptor.label = ParamHelper.toString(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "label" isn't a valid string: "${value}"`)
      }
    }
    return this
  }

  public fromAlpha(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.alpha = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromAlpha" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toAlpha(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.alpha = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toAlpha" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromX(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.x = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromX" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toX(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.x = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toX" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromY(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.y = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromY" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toY(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.y = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toY" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromXPercent(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.xPercent = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromXPercent" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toXPercent(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.xPercent = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toXPercent" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromYPercent(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.yPercent = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromYPercent" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toYPercent(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.yPercent = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toYPercent" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromScale(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.scale = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromScale" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toScale(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.scale = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toScale" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromRotation(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.rotation = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromRotation" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toRotation(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.rotation = ParamHelper.toFloat(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toRotation" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public fromWidth(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.from.width = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "fromWidth" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public toWidth(value?: ParamNumber): AnimationBuilder {
    if (value !== undefined) {
      if (ParamHelper.isNumber(value)) {
        this._descriptor.to.width = ParamHelper.toInteger(value)
      } else {
        throw TypeError(`[${AnimationBuilder.NAMESPACE}] Value for "toWidth" isn't a valid number: "${value}"`)
      }
    }
    return this
  }

  public build(): AnimationDescriptor {
    return this._descriptor
  }
}