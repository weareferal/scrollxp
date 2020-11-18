import Parser from "../src/parser"
import AnimationParser from "../src/parsers/animation.parser"
import { expect } from "chai"

describe(`Animation parser "name" test`, () => {
  it("Should return correct name", () => {
    const el = document.createElement("div")
    el.setAttribute("data-animate", "my-name")

    const parser = new Parser().create(AnimationParser)
    const descriptor = parser.parse(el)
    expect("my-name").to.equal(descriptor.name)
  })
})

describe(`Animation parser responsive "name" test`, () => {
  it("Should return correct name", () => {
    const innerWidth = global.window.innerWidth

    const el = document.createElement("div")
    el.setAttribute("data-animate", "")
    el.setAttribute("data-lg-animate", "my-name")

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1600,
    })

    const parser = new Parser().create(AnimationParser)
    const descriptor = parser.parse(el)
    expect("my-name").to.equal(descriptor.name)

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: innerWidth,
    })
  })
})

describe(`Animation parser "duration" test`, () => {
  it("Should return correct duration", () => {
    const el = document.createElement("div")
    el.setAttribute("data-animate", "")
    el.setAttribute("data-animate-duration", "5")

    const parser = new Parser().create(AnimationParser)
    const descriptor = parser.parse(el)
    expect(5).to.equal(descriptor.duration)
  })
})
