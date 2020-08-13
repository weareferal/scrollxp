import SceneBuilder from "../src/builders/scene.builder"
import { expect } from "chai"

describe(`Scene builder "enabled" test`, () => {
  it("Boolean true input should return true", () => {
    const descriptor = new SceneBuilder().enabled(true).build()
    expect(true).to.equal(descriptor.enabled)
  })
  it("Boolean false input should return false", () => {
    const descriptor = new SceneBuilder().enabled(false).build()
    expect(false).to.equal(descriptor.enabled)
  })
  it("String true input should return true", () => {
    const descriptor = new SceneBuilder().enabled("true").build()
    expect(true).to.equal(descriptor.enabled)
  })
  it("String false input should return false", () => {
    const descriptor = new SceneBuilder().enabled("false").build()
    expect(false).to.equal(descriptor.enabled)
  })
  it("Number input should return error", () => {
    expect(() => {
      new SceneBuilder().enabled("45").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return true", () => {
    const descriptor = new SceneBuilder().enabled().build()
    expect(true).to.equal(descriptor.enabled)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new SceneBuilder().enabled("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Scene builder "duration" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new SceneBuilder().duration(55).build()
    expect(55).to.equal(descriptor.duration)
  })
  it("Float input should return integer number", () => {
    const descriptor = new SceneBuilder().duration(42.3).build()
    expect(42).to.equal(descriptor.duration)
  })
  it("Percentage input should return percentage", () => {
    const descriptor = new SceneBuilder().duration("60%").build()
    expect("60%").to.equal(descriptor.duration)
  })
  it("Valid function input should return function", () => {
    const func = function () {
      return 2
    }
    const descriptor = new SceneBuilder().duration(func).build()
    expect(func).to.equal(descriptor.duration)
  })
  it("Invalid function input should return error", () => {
    const func = function () {
      return
    }
    expect(() => {
      new SceneBuilder().duration(func).build()
    }).to.throw(TypeError)
  })
  it("Empty input should return 0", () => {
    const descriptor = new SceneBuilder().duration().build()
    expect(0).to.equal(descriptor.duration)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new SceneBuilder().duration("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Scene builder "hook" test`, () => {
  it("Integer input should return integer number", () => {
    const descriptor = new SceneBuilder().hook(1).build()
    expect(1).to.equal(descriptor.hook)
  })
  it("Float input should return float number", () => {
    const descriptor = new SceneBuilder().hook(0.3).build()
    expect(0.3).to.equal(descriptor.hook)
  })
  it("String input should return float number", () => {
    const descriptor = new SceneBuilder().hook("0.2").build()
    expect(0.2).to.equal(descriptor.hook)
  })
  it("< 0 number should return error", () => {
    expect(() => {
      new SceneBuilder().hook(-1).build()
    }).to.throw(RangeError)
  })
  it("> 1 number should return error", () => {
    expect(() => {
      new SceneBuilder().hook(2).build()
    }).to.throw(RangeError)
  })
  it('"onLeave" value should return 0', () => {
    const descriptor = new SceneBuilder().hook("onLeave").build()
    expect(0).to.equal(descriptor.hook)
  })
  it('"onCenter" value should return 0.5', () => {
    const descriptor = new SceneBuilder().hook("onCenter").build()
    expect(0.5).to.equal(descriptor.hook)
  })
  it('"onEnter" value should return 1', () => {
    const descriptor = new SceneBuilder().hook("onEnter").build()
    expect(1).to.equal(descriptor.hook)
  })
  it("Empty input should return 0.5", () => {
    const descriptor = new SceneBuilder().hook().build()
    expect(0.5).to.equal(descriptor.hook)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new SceneBuilder().hook("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Scene builder "reverse" test`, () => {
  it("Boolean true input should return true", () => {
    const descriptor = new SceneBuilder().reverse(true).build()
    expect(true).to.equal(descriptor.reverse)
  })
  it("Boolean false input should return false", () => {
    const descriptor = new SceneBuilder().reverse(false).build()
    expect(false).to.equal(descriptor.reverse)
  })
  it("String true input should return true", () => {
    const descriptor = new SceneBuilder().reverse("true").build()
    expect(true).to.equal(descriptor.reverse)
  })
  it("String false input should return false", () => {
    const descriptor = new SceneBuilder().reverse("false").build()
    expect(false).to.equal(descriptor.reverse)
  })
  it("Number input should return error", () => {
    expect(() => {
      new SceneBuilder().reverse("45").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return true", () => {
    const descriptor = new SceneBuilder().reverse().build()
    expect(true).to.equal(descriptor.reverse)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new SceneBuilder().reverse("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Scene builder "pin" test`, () => {
  it("Boolean true input should return true", () => {
    const descriptor = new SceneBuilder().pin(true).build()
    expect(true).to.equal(descriptor.pin)
  })
  it("Boolean false input should return false", () => {
    const descriptor = new SceneBuilder().pin(false).build()
    expect(false).to.equal(descriptor.pin)
  })
  it("String true input should return true", () => {
    const descriptor = new SceneBuilder().pin("true").build()
    expect(true).to.equal(descriptor.pin)
  })
  it("String false input should return false", () => {
    const descriptor = new SceneBuilder().pin("false").build()
    expect(false).to.equal(descriptor.pin)
  })
  it("Number input should return error", () => {
    expect(() => {
      new SceneBuilder().pin("45").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return true", () => {
    const descriptor = new SceneBuilder().pin().build()
    expect(false).to.equal(descriptor.pin)
  })
  it("Any other input should return error", () => {
    expect(() => {
      new SceneBuilder().pin("bla").build()
    }).to.throw(TypeError)
  })
})

describe(`Scene builder "classToggle" test`, () => {
  it("String input should return string", () => {
    const descriptor = new SceneBuilder().classToggle("active").build()
    expect("active").to.equal(descriptor.classToggle)
  })
  it("Number input should return error", () => {
    expect(() => {
      new SceneBuilder().classToggle("123").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new SceneBuilder().classToggle().build()
    expect(undefined).to.equal(descriptor.classToggle)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new SceneBuilder().classToggle("true").build()
    }).to.throw(TypeError)
  })
})

describe(`Scene builder "indicator" test`, () => {
  it("String input should return string", () => {
    const descriptor = new SceneBuilder().indicator("My Indicator").build()
    expect("My Indicator").to.equal(descriptor.indicator)
  })
  it("Number input should return error", () => {
    expect(() => {
      new SceneBuilder().indicator("123").build()
    }).to.throw(TypeError)
  })
  it("Empty input should return undefined", () => {
    const descriptor = new SceneBuilder().indicator().build()
    expect(undefined).to.equal(descriptor.indicator)
  })
  it("Boolean input should return error", () => {
    expect(() => {
      new SceneBuilder().indicator("true").build()
    }).to.throw(TypeError)
  })
})
