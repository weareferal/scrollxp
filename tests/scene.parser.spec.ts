import Parser from "../src/parser"
import SceneParser from "../src/parsers/scene.parser"
import { expect } from "chai"

describe(`Scene parser "name" test`, () => {
  it("Should return correct name", () => {
    const el = document.createElement("div")
    el.setAttribute("data-scene", "my-name")

    const parser = new Parser().create(SceneParser)
    const descriptor = parser.parse(el)
    expect("my-name").to.equal(descriptor.name)
  })
})

describe(`Scene parser "duration" test`, () => {
  it("Should return correct duration", () => {
    const el = document.createElement("div")
    el.setAttribute("data-scene", "")
    el.setAttribute("data-scene-duration", "100%")

    const parser = new Parser().create(SceneParser)
    const descriptor = parser.parse(el)
    expect("100%").to.equal(descriptor.duration)
  })
})
