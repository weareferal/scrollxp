import Parser from "../src/parser"
import AnimationParser from "../src/parsers/animation.parser"
import AnimationCreator from "../src/creator/animation.creator"
import { expect } from "chai"

describe(`Animation creator "stagger" test`, () => {
  it("Should have stagger property when only to() is set", () => {
    const el = document.createElement("div")
    el.setAttribute("data-animate", "")
    el.setAttribute("data-animate-to-alpha", "0")
    el.setAttribute("data-animate-stagger", "0.2")

    const children1 = document.createElement("span")
    el.appendChild(children1)
    const children2 = document.createElement("span")
    el.appendChild(children2)

    const parser = new Parser().create(AnimationParser)
    const descriptor = parser.parse(el)

    const creator = new AnimationCreator()
    creator.add(el, descriptor)

    const timeline = creator.create()
    const tween = timeline.getChildren()[0]

    expect(0.2).to.equal(tween.vars.stagger)
  })
  it("Should have stagger property when only from() is set", () => {
    const el = document.createElement("div")
    el.setAttribute("data-animate", "")
    el.setAttribute("data-animate-from-alpha", "0")
    el.setAttribute("data-animate-stagger", "0.3")

    const children1 = document.createElement("span")
    el.appendChild(children1)
    const children2 = document.createElement("span")
    el.appendChild(children2)

    const parser = new Parser().create(AnimationParser)
    const descriptor = parser.parse(el)

    const creator = new AnimationCreator()
    creator.add(el, descriptor)

    const timeline = creator.create()
    const tween = timeline.getChildren()[0]

    expect(0.3).to.equal(tween.vars.stagger)
  })
  it("Should have stagger property when from() and to() are set", () => {
    const el = document.createElement("div")
    el.setAttribute("data-animate", "")
    el.setAttribute("data-animate-from-alpha", "0")
    el.setAttribute("data-animate-to-alpha", "1")
    el.setAttribute("data-animate-stagger", "0.4")

    const children1 = document.createElement("span")
    el.appendChild(children1)
    const children2 = document.createElement("span")
    el.appendChild(children2)

    const parser = new Parser().create(AnimationParser)
    const descriptor = parser.parse(el)

    const creator = new AnimationCreator()
    creator.add(el, descriptor)

    const timeline = creator.create()
    const tween = timeline.getChildren()[0]

    expect(0.4).to.equal(tween.vars.stagger)
  })
})
