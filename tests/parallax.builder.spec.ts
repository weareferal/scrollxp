import ParallaxBuilder from "../src/builders/parallax.builder"
import { expect } from "chai"

describe(`Parallax builder "element" test`, () => {
  it("Element input should return element", () => {
    const div = document.createElement("div")
    const descriptor = new ParallaxBuilder().element(div).build()
    expect(div).to.equal(descriptor.element)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new ParallaxBuilder().element().build()
    expect(undefined).to.equal(descriptor.element)
  })
})

describe(`Parallax builder "enabled" test`, () => {
  it("Boolean true input should return true", () => {
    const descriptor = new ParallaxBuilder().enabled(true).build()
    expect(true).to.equal(descriptor.enabled)
  })
  it("Boolean false input should return false", () => {
    const descriptor = new ParallaxBuilder().enabled(false).build()
    expect(false).to.equal(descriptor.enabled)
  })
  it("String true input should return true", () => {
    const descriptor = new ParallaxBuilder().enabled("true").build()
    expect(true).to.equal(descriptor.enabled)
  })
  it("String false input should return false", () => {
    const descriptor = new ParallaxBuilder().enabled("false").build()
    expect(false).to.equal(descriptor.enabled)
  })
  it("Number input should return error", () => {
    expect(() => {
      new ParallaxBuilder().enabled("45").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return true", () => {
    const descriptor = new ParallaxBuilder().enabled().build()
    expect(true).to.equal(descriptor.enabled)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().enabled("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "type" test`, () => {
  it('"global" input should return "global"', () => {
    const descriptor = new ParallaxBuilder().type("global").build()
    expect("global").to.equal(descriptor.type)
  })
  it('"scene" input should return "scene"', () => {
    const descriptor = new ParallaxBuilder().type("scene").build()
    expect("scene").to.equal(descriptor.type)
  })
  it('Empty input should return "global"', () => {
    const descriptor = new ParallaxBuilder().type().build()
    expect("global").to.equal(descriptor.type)
  })
  it("Number input should return error", () => {
    expect(() => {
      new ParallaxBuilder().type("123").build()
    }).to.throw(TypeError)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new ParallaxBuilder().type("true").build()
    }).to.throw(TypeError)
  })
  it("Any other string should return error", () => {
    expect(() => {
      new ParallaxBuilder().type("bla").build()
    }).to.throw(Error)
  })
})

describe(`Parallax builder "speed" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new ParallaxBuilder().speed(55).build()
    expect(55).to.equal(descriptor.speed)
  })
  it("Float input should return integer number", () => {
    const descriptor = new ParallaxBuilder().speed(14.3).build()
    expect(14).to.equal(descriptor.speed)
  })
  it("String input should return integer number", () => {
    const descriptor = new ParallaxBuilder().speed("15.6").build()
    expect(15).to.equal(descriptor.speed)
  })
  it("Empty input should return 1", () => {
    const descriptor = new ParallaxBuilder().speed().build()
    expect(1).to.equal(descriptor.speed)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().speed("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "momentum" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new ParallaxBuilder().momentum(55).build()
    expect(55).to.equal(descriptor.momentum)
  })
  it("Float input should return float number", () => {
    const descriptor = new ParallaxBuilder().momentum(14.3).build()
    expect(14.3).to.equal(descriptor.momentum)
  })
  it("String input should return number", () => {
    const descriptor = new ParallaxBuilder().momentum("42.3").build()
    expect(42.3).to.equal(descriptor.momentum)
  })
  it("Empty input should return 0.3", () => {
    const descriptor = new ParallaxBuilder().momentum().build()
    expect(0.3).to.equal(descriptor.momentum)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().momentum("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "stagger" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new ParallaxBuilder().stagger(55).build()
    expect(55).to.equal(descriptor.stagger)
  })
  it("Float input should return float number", () => {
    const descriptor = new ParallaxBuilder().stagger(14.3).build()
    expect(14.3).to.equal(descriptor.stagger)
  })
  it("String input should return number", () => {
    const descriptor = new ParallaxBuilder().stagger("42.3").build()
    expect(42.3).to.equal(descriptor.stagger)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new ParallaxBuilder().stagger().build()
    expect(undefined).to.equal(descriptor.stagger)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().stagger("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "ease" test`, () => {
  it("String input should return string", () => {
    const descriptor = new ParallaxBuilder().ease("power4.out").build()
    expect("power4.out").to.equal(descriptor.ease)
  })
  it("Number input should return error", () => {
    expect(() => {
      new ParallaxBuilder().ease("123").build()
    }).to.throw(TypeError)
  })
  it('Empty input should return "none"', () => {
    const descriptor = new ParallaxBuilder().ease().build()
    expect("none").to.equal(descriptor.ease)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new ParallaxBuilder().ease("true").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "duration" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new ParallaxBuilder().duration(55).build()
    expect(55).to.equal(descriptor.duration)
  })
  it("Float input should return integer number", () => {
    const descriptor = new ParallaxBuilder().duration(42.3).build()
    expect(42).to.equal(descriptor.duration)
  })
  it("Percentage input should return percentage", () => {
    const descriptor = new ParallaxBuilder().duration("60%").build()
    expect("60%").to.equal(descriptor.duration)
  })
  it("Valid function input should return function", () => {
    const func = function () {
      return 2
    }
    const descriptor = new ParallaxBuilder().duration(func).build()
    expect(func).to.equal(descriptor.duration)
  })
  it('Empty input should return "100%"', () => {
    const descriptor = new ParallaxBuilder().duration().build()
    expect("100%").to.equal(descriptor.duration)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().duration("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "hook" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new ParallaxBuilder().hook(1).build()
    expect(1).to.equal(descriptor.hook)
  })
  it("Float input should return float number", () => {
    const descriptor = new ParallaxBuilder().hook(0.3).build()
    expect(0.3).to.equal(descriptor.hook)
  })
  it("String input should return float number", () => {
    const descriptor = new ParallaxBuilder().hook("0.2").build()
    expect(0.2).to.equal(descriptor.hook)
  })
  it("< 0 number should return error", () => {
    expect(() => {
      new ParallaxBuilder().hook(-1).build()
    }).to.throw(RangeError)
  })
  it("> 1 number should return error", () => {
    expect(() => {
      new ParallaxBuilder().hook(2).build()
    }).to.throw(RangeError)
  })
  it('"onLeave" value should return 0', () => {
    const descriptor = new ParallaxBuilder().hook("onLeave").build()
    expect(0).to.equal(descriptor.hook)
  })
  it('"onCenter" value should return 0.5', () => {
    const descriptor = new ParallaxBuilder().hook("onCenter").build()
    expect(0.5).to.equal(descriptor.hook)
  })
  it('"onEnter" value should return 1', () => {
    const descriptor = new ParallaxBuilder().hook("onEnter").build()
    expect(1).to.equal(descriptor.hook)
  })
  it("Empty input should return 0.5", () => {
    const descriptor = new ParallaxBuilder().hook().build()
    expect(0.5).to.equal(descriptor.hook)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().hook("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "offset" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new ParallaxBuilder().offset(55).build()
    expect(55).to.equal(descriptor.offset)
  })
  it("Float input should return integer number", () => {
    const descriptor = new ParallaxBuilder().offset(14.3).build()
    expect(14).to.equal(descriptor.offset)
  })
  it("String input should return integer number", () => {
    const descriptor = new ParallaxBuilder().offset("15.6").build()
    expect(15).to.equal(descriptor.offset)
  })
  it("Empty input should return 0", () => {
    const descriptor = new ParallaxBuilder().offset().build()
    expect(0).to.equal(descriptor.offset)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new ParallaxBuilder().offset("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Parallax builder "indicator" test`, () => {
  it("String input should return string", () => {
    const descriptor = new ParallaxBuilder().indicator("My Indicator").build()
    expect("My Indicator").to.equal(descriptor.indicator)
  })
  it("Number input should return error", () => {
    expect(() => {
      new ParallaxBuilder().indicator("123").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new ParallaxBuilder().indicator().build()
    expect(undefined).to.equal(descriptor.indicator)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new ParallaxBuilder().indicator("true").build()
    }).to.throw(TypeError)
  })
})
