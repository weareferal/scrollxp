import AnimationBuilder from "../src/builders/animation.builder"
import { expect } from "chai"

describe(`Animation builder "default" test`, () => {
  it("Should set default options", () => {
    const defaultOptions = new AnimationBuilder()
      .duration(2)
      .position("+=1")
      .repeat(1)
      .yoyo(true)
      .delay(1)
      .ease("power2.out")
      .momentum(2)
      .transformOrigin("left left")
      .fromAlpha(0)
      .toAlpha(1)
      .fromX(-100)
      .toX(100)
      .fromY(-200)
      .toY(200)
      .fromXPercent(30)
      .toXPercent(60)
      .fromYPercent(20)
      .toYPercent(40)
      .fromScale(0.5)
      .toScale(1)
      .fromRotation(180)
      .toRotation(360)
      .fromWidth(35)
      .toWidth(70)
      .build()

    const descriptor = new AnimationBuilder("custom-name", defaultOptions).build()

    expect(descriptor.duration).to.equal(2)
    expect(descriptor.position).to.equal("+=1")
    expect(descriptor.repeat).to.equal(1)
    expect(descriptor.yoyo).to.equal(true)
    expect(descriptor.delay).to.equal(1)
    expect(descriptor.ease).to.equal("power2.out")
    expect(descriptor.momentum).to.equal(2)
    expect(descriptor.transformOrigin).to.equal("left left")
    expect(descriptor.from.alpha).to.equal(0)
    expect(descriptor.to.alpha).to.equal(1)
    expect(descriptor.from.x).to.equal(-100)
    expect(descriptor.to.x).to.equal(100)
    expect(descriptor.from.y).to.equal(-200)
    expect(descriptor.to.y).to.equal(200)
    expect(descriptor.from.xPercent).to.equal(30)
    expect(descriptor.to.xPercent).to.equal(60)
    expect(descriptor.from.yPercent).to.equal(20)
    expect(descriptor.to.yPercent).to.equal(40)
    expect(descriptor.from.scale).to.equal(0.5)
    expect(descriptor.to.scale).to.equal(1)
    expect(descriptor.from.rotation).to.equal(180)
    expect(descriptor.to.rotation).to.equal(360)
    expect(descriptor.from.width).to.equal(35)
    expect(descriptor.to.width).to.equal(70)
  })
  it("Shouldn't be possible to set a default name", () => {
    const defaultOptions = new AnimationBuilder("default-name").build()
    expect(() => {
      new AnimationBuilder("custom-animnameation", defaultOptions).build()
    }).to.throw(Error)
  })
  it("Shouldn't be possible to set a default label", () => {
    const defaultOptions = new AnimationBuilder().label("my-label").build()
    expect(() => {
      new AnimationBuilder("custom-name", defaultOptions).build()
    }).to.throw(Error)
  })
})

describe(`Animation builder "name" test`, () => {
  it("Name should be a string", () => {
    expect(() => {
      new AnimationBuilder("123").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "duration" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().duration(55).build()
    expect(55).to.equal(descriptor.duration)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().duration(14.3).build()
    expect(14.3).to.equal(descriptor.duration)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().duration("55").build()
    expect(55).to.equal(descriptor.duration)
  })
  it("Empty input should return 1", () => {
    const descriptor = new AnimationBuilder().duration().build()
    expect(1).to.equal(descriptor.duration)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().duration("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "position" test`, () => {
  it("String input should return string", () => {
    const descriptor = new AnimationBuilder().position("+=2").build()
    expect("+=2").to.equal(descriptor.position)
  })
  it("Number input should return error", () => {
    expect(() => {
      new AnimationBuilder().position("123").build()
    }).to.throw(TypeError)
  })
  it('Empty input should return "+=0"', () => {
    const descriptor = new AnimationBuilder().position().build()
    expect("+=0").to.equal(descriptor.position)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new AnimationBuilder().position("true").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "repeat" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().repeat(55).build()
    expect(55).to.equal(descriptor.repeat)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().repeat(14.3).build()
    expect(14).to.equal(descriptor.repeat)
  })
  it("String input should return integer number", () => {
    const descriptor = new AnimationBuilder().repeat("15.6").build()
    expect(15).to.equal(descriptor.repeat)
  })
  it("Empty input should return 0", () => {
    const descriptor = new AnimationBuilder().repeat().build()
    expect(0).to.equal(descriptor.repeat)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().repeat("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "yoyo" test`, () => {
  it("Boolean true input should return true", () => {
    const descriptor = new AnimationBuilder().yoyo(true).build()
    expect(true).to.equal(descriptor.yoyo)
  })
  it("Boolean false input should return false", () => {
    const descriptor = new AnimationBuilder().yoyo(false).build()
    expect(false).to.equal(descriptor.yoyo)
  })
  it("String true input should return true", () => {
    const descriptor = new AnimationBuilder().yoyo("true").build()
    expect(true).to.equal(descriptor.yoyo)
  })
  it("String false input should return false", () => {
    const descriptor = new AnimationBuilder().yoyo("false").build()
    expect(false).to.equal(descriptor.yoyo)
  })
  it("Number input should return error", () => {
    expect(() => {
      new AnimationBuilder().yoyo("45").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return false", () => {
    const descriptor = new AnimationBuilder().yoyo().build()
    expect(false).to.equal(descriptor.yoyo)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().yoyo("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "delay" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().delay(55).build()
    expect(55).to.equal(descriptor.delay)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().delay(14.3).build()
    expect(14.3).to.equal(descriptor.delay)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().delay("55").build()
    expect(55).to.equal(descriptor.delay)
  })
  it("Empty input should return 0", () => {
    const descriptor = new AnimationBuilder().delay().build()
    expect(0).to.equal(descriptor.delay)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().delay("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "momentum" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().momentum(55).build()
    expect(55).to.equal(descriptor.momentum)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().momentum(14.3).build()
    expect(14.3).to.equal(descriptor.momentum)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().momentum("55").build()
    expect(55).to.equal(descriptor.momentum)
  })
  it("Empty input should return 0", () => {
    const descriptor = new AnimationBuilder().momentum().build()
    expect(0).to.equal(descriptor.momentum)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().momentum("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "stagger" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().stagger(55).build()
    expect(55).to.equal(descriptor.stagger)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().stagger(14.3).build()
    expect(14.3).to.equal(descriptor.stagger)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().stagger("55").build()
    expect(55).to.equal(descriptor.stagger)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().stagger().build()
    expect(undefined).to.equal(descriptor.stagger)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().stagger("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "transformOrigin" test`, () => {
  it("String input should return string", () => {
    const descriptor = new AnimationBuilder().transformOrigin("center left").build()
    expect("center left").to.equal(descriptor.transformOrigin)
  })
  it("Number input should return error", () => {
    expect(() => {
      new AnimationBuilder().transformOrigin("123").build()
    }).to.throw(TypeError)
  })
  it('Empty input should return "center center"', () => {
    const descriptor = new AnimationBuilder().transformOrigin().build()
    expect("center center").to.equal(descriptor.transformOrigin)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new AnimationBuilder().transformOrigin("true").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "ease" test`, () => {
  it("String input should return string", () => {
    const descriptor = new AnimationBuilder().ease("power4.out").build()
    expect("power4.out").to.equal(descriptor.ease)
  })
  it("Number input should return error", () => {
    expect(() => {
      new AnimationBuilder().ease("123").build()
    }).to.throw(TypeError)
  })
  it('Empty input should return "power1.out"', () => {
    const descriptor = new AnimationBuilder().ease().build()
    expect("power1.out").to.equal(descriptor.ease)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new AnimationBuilder().ease("true").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "label" test`, () => {
  it("String input should return string", () => {
    const descriptor = new AnimationBuilder().label("My Label").build()
    expect("My Label").to.equal(descriptor.label)
  })
  it("Number input should return error", () => {
    expect(() => {
      new AnimationBuilder().label("123").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().label().build()
    expect(undefined).to.equal(descriptor.label)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new AnimationBuilder().label("true").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromAlpha" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromAlpha(1).build()
    expect(1).to.equal(descriptor.from.alpha)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().fromAlpha(0.3).build()
    expect(0.3).to.equal(descriptor.from.alpha)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromAlpha("0.5").build()
    expect(0.5).to.equal(descriptor.from.alpha)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromAlpha().build()
    expect(undefined).to.equal(descriptor.from.alpha)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromAlpha("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toAlpha" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toAlpha(1).build()
    expect(1).to.equal(descriptor.to.alpha)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().toAlpha(0.3).build()
    expect(0.3).to.equal(descriptor.to.alpha)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toAlpha("0.5").build()
    expect(0.5).to.equal(descriptor.to.alpha)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toAlpha().build()
    expect(undefined).to.equal(descriptor.to.alpha)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toAlpha("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromX" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromX(100).build()
    expect(100).to.equal(descriptor.from.x)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromX(50.3).build()
    expect(50).to.equal(descriptor.from.x)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromX("45.6").build()
    expect(45).to.equal(descriptor.from.x)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromX().build()
    expect(undefined).to.equal(descriptor.from.x)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromX("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toX" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toX(100).build()
    expect(100).to.equal(descriptor.to.x)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().toX(50.3).build()
    expect(50).to.equal(descriptor.to.x)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toX("45.6").build()
    expect(45).to.equal(descriptor.to.x)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toX().build()
    expect(undefined).to.equal(descriptor.to.x)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toX("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromY" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromY(100).build()
    expect(100).to.equal(descriptor.from.y)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromY(50.3).build()
    expect(50).to.equal(descriptor.from.y)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromY("45.6").build()
    expect(45).to.equal(descriptor.from.y)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromY().build()
    expect(undefined).to.equal(descriptor.from.y)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromY("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toY" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toY(100).build()
    expect(100).to.equal(descriptor.to.y)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().toY(50.3).build()
    expect(50).to.equal(descriptor.to.y)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toY("45.6").build()
    expect(45).to.equal(descriptor.to.y)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toY().build()
    expect(undefined).to.equal(descriptor.to.y)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toY("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromXPercent" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromXPercent(100).build()
    expect(100).to.equal(descriptor.from.xPercent)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().fromXPercent(50.3).build()
    expect(50.3).to.equal(descriptor.from.xPercent)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromXPercent("45.6").build()
    expect(45.6).to.equal(descriptor.from.xPercent)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromXPercent().build()
    expect(undefined).to.equal(descriptor.from.xPercent)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromXPercent("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toXPercent" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toXPercent(100).build()
    expect(100).to.equal(descriptor.to.xPercent)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().toXPercent(50.3).build()
    expect(50.3).to.equal(descriptor.to.xPercent)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toXPercent("45.6").build()
    expect(45.6).to.equal(descriptor.to.xPercent)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toXPercent().build()
    expect(undefined).to.equal(descriptor.to.xPercent)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toXPercent("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromYPercent" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromYPercent(100).build()
    expect(100).to.equal(descriptor.from.yPercent)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().fromYPercent(50.3).build()
    expect(50.3).to.equal(descriptor.from.yPercent)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromYPercent("45.6").build()
    expect(45.6).to.equal(descriptor.from.yPercent)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromYPercent().build()
    expect(undefined).to.equal(descriptor.from.yPercent)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromYPercent("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toYPercent" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toYPercent(100).build()
    expect(100).to.equal(descriptor.to.yPercent)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().toYPercent(50.3).build()
    expect(50.3).to.equal(descriptor.to.yPercent)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toYPercent("45.6").build()
    expect(45.6).to.equal(descriptor.to.yPercent)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toYPercent().build()
    expect(undefined).to.equal(descriptor.to.yPercent)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toYPercent("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromScale" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromScale(100).build()
    expect(100).to.equal(descriptor.from.scale)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().fromScale(50.3).build()
    expect(50.3).to.equal(descriptor.from.scale)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromScale("45.6").build()
    expect(45.6).to.equal(descriptor.from.scale)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromScale().build()
    expect(undefined).to.equal(descriptor.from.scale)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromScale("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toScale" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toScale(100).build()
    expect(100).to.equal(descriptor.to.scale)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().toScale(50.3).build()
    expect(50.3).to.equal(descriptor.to.scale)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toScale("45.6").build()
    expect(45.6).to.equal(descriptor.to.scale)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toScale().build()
    expect(undefined).to.equal(descriptor.to.scale)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toScale("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromRotation" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromRotation(100).build()
    expect(100).to.equal(descriptor.from.rotation)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().fromRotation(50.3).build()
    expect(50.3).to.equal(descriptor.from.rotation)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromRotation("45.6").build()
    expect(45.6).to.equal(descriptor.from.rotation)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromRotation().build()
    expect(undefined).to.equal(descriptor.from.rotation)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromRotation("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toRotation" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toRotation(100).build()
    expect(100).to.equal(descriptor.to.rotation)
  })
  it("Float input should return float number", () => {
    const descriptor = new AnimationBuilder().toRotation(50.3).build()
    expect(50.3).to.equal(descriptor.to.rotation)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toRotation("45.6").build()
    expect(45.6).to.equal(descriptor.to.rotation)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toRotation().build()
    expect(undefined).to.equal(descriptor.to.rotation)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toRotation("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "fromWidth" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromWidth(100).build()
    expect(100).to.equal(descriptor.from.width)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().fromWidth(50.3).build()
    expect(50).to.equal(descriptor.from.width)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().fromWidth("45.6").build()
    expect(45).to.equal(descriptor.from.width)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().fromWidth().build()
    expect(undefined).to.equal(descriptor.from.width)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().fromWidth("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Animation builder "toWidth" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new AnimationBuilder().toWidth(100).build()
    expect(100).to.equal(descriptor.to.width)
  })
  it("Float input should return integer number", () => {
    const descriptor = new AnimationBuilder().toWidth(50.3).build()
    expect(50).to.equal(descriptor.to.width)
  })
  it("String input should return number", () => {
    const descriptor = new AnimationBuilder().toWidth("45.6").build()
    expect(45).to.equal(descriptor.to.width)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new AnimationBuilder().toWidth().build()
    expect(undefined).to.equal(descriptor.to.width)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new AnimationBuilder().toWidth("bla").build()
    }).to.throw(TypeError)
  })
})
