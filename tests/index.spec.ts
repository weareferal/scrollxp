import ScrollXP from "../src/index"
import { expect } from "chai"

describe(`Registered elements test`, () => {
  const globalWindow = global.Window

  before(() => {
    global.Window = window.Window
  })

  // TODO: Fix __SCROLLXP_VERSION__ is not defined. I still don't know how.
  // TODO: Fix report not being generated. I think the problem is related to the animation loop. It'll probably need a destroy() method.
  it("Should register animation", () => {
    const view = new ScrollXP({
      container: document.body,
    })

    const fadeIn = new ScrollXP.Animation("fade-in").fromAlpha(0).toAlpha(1).build()

    view.register(fadeIn)

    const registeredAnimations = view.getRegisteredAnimations()

    expect(registeredAnimations).to.be.an("object")
    expect(registeredAnimations["fade-in"]).to.deep.equal(fadeIn)
  })

  after(() => {
    global.Window = globalWindow
  })
})
