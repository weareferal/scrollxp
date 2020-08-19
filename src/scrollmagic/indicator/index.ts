import Scene from "../scene"
import Controller from "../controller"
import Template from "./template"
import DomUtils from "../utils/dom"
import Logger from "../utils/logger"
import { SceneEventVars } from "../../interfaces"

export interface IndicatorOptions {
  name?: string
  colorStart?: string
  colorEnd?: string
  colorTrigger?: string
  parent?: HTMLElement
  indent?: number
}

export interface IndicatorGroup {
  triggerHook: number
  element: HTMLElement
  members: Indicator[]
}

const DEFAULT = {
  colorStart: "green",
  colorEnd: "red",
  colorTrigger: "blue",
}

export default class Indicator {
  private scene: Scene
  private controller: Controller
  private elemBounds: HTMLElement
  private elemStart: HTMLElement
  private elemEnd: HTMLElement
  private boundsContainer: HTMLElement | Window
  private isVertical: boolean

  public options: IndicatorOptions
  public bounds: HTMLElement
  public triggerGroup?: IndicatorGroup

  public static FONT_SIZE = "0.85em"
  public static ZINDEX = "9999"
  public static EDGE_OFFSET = 15

  constructor(scene: Scene, options?: IndicatorOptions, autoIndex?: number) {
    this.scene = scene
    this.options = this.createOptions(options, autoIndex)

    this.elemBounds = Template.bounds()
    this.elemStart = Template.start(this.options.colorStart || DEFAULT.colorStart)
    this.elemEnd = Template.end(this.options.colorEnd || DEFAULT.colorEnd)

    // Prepare bounds elements
    if (this.elemStart.firstChild) {
      this.elemStart.firstChild.textContent += ` ${this.options.name}`
    }
    this.elemEnd.textContent += ` ${this.options.name}`
    this.elemBounds.appendChild(this.elemStart)
    this.elemBounds.appendChild(this.elemEnd)

    this.bounds = this.elemBounds
  }

  // Add indicators to DOM
  add(): void {
    this.controller = this.scene.controller
    this.isVertical = this.controller.info().isVertical

    const isDocument: boolean = this.controller.info().isDocument

    // No parent supplied or doesnt exist
    if (!this.options.parent || DomUtils.getElements(this.options.parent)[0]) {
      if (isDocument) {
        this.boundsContainer = document.body // Check if window/document (then use body)
      } else if (this.controller.info().smoothScrolling) {
        // Add indicator inside smooth scrolling container
        this.boundsContainer = <HTMLElement>(<HTMLElement>this.controller.info().container).children[0]
      } else {
        this.boundsContainer = <HTMLElement>this.controller.info().container
      }
    }

    if (!isDocument && DomUtils.css(<HTMLElement>this.boundsContainer, "position") === "static") {
      // Position mode needed for correct positioning of indicators
      DomUtils.css(<HTMLElement>this.boundsContainer, { position: "relative" })
    }

    // Add listeners for updates
    this.scene.on("change.plugin_addIndicators", this.handleTriggerParamsChange.bind(this))
    this.scene.on("shift.plugin_addIndicators", this.handleBoundsParamsChange.bind(this))

    // Updates trigger & bounds (will add elements if needed)
    this.updateTriggerGroup()
    this.updateBounds()

    setTimeout(() => {
      // Do after all execution is finished otherwise sometimes size calculations are off
      this.controller?.indicators.updateBoundsPositions(this)
    }, 0)

    this.log(3, "Added indicators")
  }

  // Remove indicators from DOM
  remove(): void {
    if (this.triggerGroup) {
      // If not set there's nothing to remove
      this.scene.off("change.plugin_addIndicators", this.handleTriggerParamsChange)
      this.scene.off("shift.plugin_addIndicators", this.handleBoundsParamsChange)

      if (this.triggerGroup.members.length > 1) {
        // Just remove from memberlist of old group
        const group = this.triggerGroup
        group.members.splice(group.members.indexOf(this), 1)
        this.controller.indicators.updateTriggerGroupLabel(group)
        this.controller.indicators.updateTriggerGroupPositions(group)
        this.triggerGroup = undefined
      } else {
        // Remove complete group
        this.removeTriggerGroup()
      }
      this.removeBounds()

      this.log(3, "Removed indicators")
    }
  }

  /*
   * ----------------------------------------------------------------
   * Internal Event Handlers
   * ----------------------------------------------------------------
   */

  // Event handler for when bounds params change
  handleBoundsParamsChange(): void {
    this.updateBounds()
  }

  // Event handler for when trigger params change
  handleTriggerParamsChange(e: SceneEventVars): void {
    if (e.what === "triggerHook") {
      this.updateTriggerGroup()
    }
  }

  /*
   * ----------------------------------------------------------------
   * Bounds (start / stop) management
   * ----------------------------------------------------------------
   */

  // Adds an new bounds elements to the array and to the DOM
  addBounds(): void {
    const isVertical: boolean = this.controller.info().isVertical

    // Apply stuff we didn't know before...
    DomUtils.css(<HTMLElement>this.elemStart.firstChild, {
      "border-bottom-width": isVertical ? 1 : 0,
      "border-right-width": isVertical ? 0 : 1,
      bottom: isVertical ? -1 : this.options.indent,
      right: isVertical ? this.options.indent : -1,
      padding: isVertical ? "0 8px" : "2px 4px",
    })

    DomUtils.css(this.elemEnd, {
      "border-top-width": isVertical ? "1" : "0",
      "border-left-width": isVertical ? "0" : "1",
      top: isVertical ? "100%" : "",
      right: isVertical ? this.options.indent : "",
      bottom: isVertical ? "" : this.options.indent,
      left: isVertical ? "" : "100%",
      padding: isVertical ? "0 8px" : "2px 4px",
    })

    // Append
    if (this.boundsContainer instanceof HTMLElement) {
      this.boundsContainer.appendChild(this.elemBounds)
    }
  }

  // Remove bounds from list and DOM
  removeBounds(): void {
    if (this.elemBounds.parentNode) {
      this.elemBounds.parentNode.removeChild(this.elemBounds)
    }
  }

  // Update the start and end positions of the scene
  updateBounds(): void {
    if (this.elemBounds.parentNode !== this.boundsContainer) {
      this.addBounds() // Add Bounds elements (start/end)
    }

    const css = {}

    css[this.isVertical ? "top" : "left"] = this.scene.triggerPosition
    css[this.isVertical ? "height" : "width"] = this.scene.duration

    DomUtils.css(this.elemBounds, css)

    DomUtils.css(this.elemEnd, {
      display: this.scene.duration > 0 ? "" : "none",
    })
  }

  /*
   * ----------------------------------------------------------------
   * Trigger and trigger group management
   * ----------------------------------------------------------------
   */

  // Adds an new trigger group to the array and to the DOM
  addTriggerGroup(): void {
    const triggerElem = Template.trigger(this.options.colorTrigger || DEFAULT.colorTrigger) // New trigger element

    const css = {}
    css[this.isVertical ? "right" : "bottom"] = 0
    css[this.isVertical ? "border-top-width" : "border-left-width"] = 1

    DomUtils.css(<HTMLElement>triggerElem.firstChild, css)

    DomUtils.css(<HTMLElement>triggerElem.firstChild?.firstChild, {
      padding: this.isVertical ? "0 8px 3px 8px" : "3px 4px",
    })

    document.body.appendChild(triggerElem) // Directly add to body

    const newGroup: IndicatorGroup = {
      triggerHook: this.scene.triggerHook,
      element: triggerElem,
      members: [this],
    }

    this.controller.indicators.groups?.push(newGroup)

    this.triggerGroup = newGroup

    // Update right away
    this.controller.indicators.updateTriggerGroupLabel(newGroup)
    this.controller.indicators.updateTriggerGroupPositions(newGroup)
  }

  removeTriggerGroup(): void {
    if (this.triggerGroup) {
      this.controller.indicators.groups?.splice(this.controller.indicators.groups?.indexOf(this.triggerGroup), 1)
    }
    this.triggerGroup?.element.parentNode?.removeChild(this.triggerGroup?.element)
    this.triggerGroup = undefined
  }

  // Updates the trigger group -> either join existing or add new one
  /*
   * Logic:
   * 1 if a trigger group exist, check if it's in sync with Scene settings – if so, nothing else needs to happen
   * 2 try to find an existing one that matches Scene parameters
   * 	 2.1 If a match is found check if already assigned to an existing group
   *			 If so:
   *       A: it was the last member of existing group -> kill whole group
   *       B: the existing group has other members -> just remove from member list
   *	 2.2 Assign to matching group
   * 3 if no new match could be found, check if assigned to existing group
   *   A: yes, and it's the only member -> just update parameters and positions and keep using this group
   *   B: yes but there are other members -> remove from member list and create a new one
   *   C: no, so create a new one
   */
  updateTriggerGroup(): void {
    const triggerHook = this.scene.triggerHook
    const closeEnough = 0.0001

    // Have a group, check if it still matches
    if (this.triggerGroup) {
      if (Math.abs(this.triggerGroup?.triggerHook - triggerHook) < closeEnough) {
        // Logger.log(0, "trigger", options.name, "->", "no need to change, still in sync");
        return // all good
      }
    }

    // Don't have a group, check if a matching one exists
    // Logger.log(0, "trigger", options.name, "->", "out of sync!");
    const groups: IndicatorGroup[] = this.controller.indicators.groups || []
    let i = groups?.length
    let group: IndicatorGroup

    while (i--) {
      group = groups[i]

      if (Math.abs(group.triggerHook - triggerHook) < closeEnough) {
        // found a match!
        // Logger.log(0, "trigger", options.name, "->", "found match");
        if (this.triggerGroup) {
          // do I have an old group that is out of sync?
          if (this.triggerGroup.members.length === 1) {
            // is it the only remaining group?
            // Logger.log(0, "trigger", options.name, "->", "kill");
            // was the last member, remove the whole group
            this.removeTriggerGroup()
          } else {
            this.triggerGroup.members.splice(this.triggerGroup.members.indexOf(this), 1) // Just remove from memberlist of old group
            this.controller.indicators.updateTriggerGroupLabel(this.triggerGroup)
            this.controller.indicators.updateTriggerGroupPositions(this.triggerGroup)
            // Logger.log(0, "trigger", options.name, "->", "removing from previous member list");
          }
        }

        // Join new group
        group.members.push(this)
        this.triggerGroup = group
        this.controller.indicators.updateTriggerGroupLabel(group)

        return
      }
    }

    // At this point I am obviously out of sync and don't match any other group
    if (this.triggerGroup) {
      if (this.triggerGroup.members.length === 1) {
        // Logger.log(0, "trigger", options.name, "->", "updating existing");
        // out of sync but i'm the only member => just change and update
        this.triggerGroup.triggerHook = triggerHook
        this.controller.indicators.updateTriggerGroupPositions(this.triggerGroup)
        return
      } else {
        // Logger.log(0, "trigger", options.name, "->", "removing from previous member list");
        this.triggerGroup.members.splice(this.triggerGroup.members.indexOf(this), 1) // Just remove from memberlist of old group
        this.controller.indicators.updateTriggerGroupLabel(this.triggerGroup)
        this.controller.indicators.updateTriggerGroupPositions(this.triggerGroup)
        this.triggerGroup = undefined // Need a brand new group...
      }
    }

    // Logger.log(0, "trigger", options.name, "->", "add a new one")
    // Did not find any match, make new trigger group
    this.addTriggerGroup()
  }

  /**
   * Send a debug message to the console.
   *
   * @param {number} loglevel - The loglevel required to initiate output for the message.
   * @param {...mixed} output - One or more variables that should be passed to the console.
   */
  private log(logLevel: number, ...args: any[]): void {
    if (this.scene.logLevel && this.scene.logLevel >= logLevel) {
      Array.prototype.splice.call(args, 1, 0, "(INDICATOR) ->")
      Logger.log.apply(window, args)
    }
  }

  private createOptions(options?: IndicatorOptions, autoIndex?: number): IndicatorOptions {
    const newOptions = {
      name: "No Name",
      colorStart: DEFAULT.colorStart,
      colorEnd: DEFAULT.colorEnd,
      colorTrigger: DEFAULT.colorTrigger,
      parent: <HTMLElement | undefined>undefined,
      indent: <number | undefined>0,
    }

    if (options?.name !== undefined) {
      newOptions.name = options?.name
    } else if (autoIndex !== undefined) {
      newOptions.name = `${autoIndex}`
    }

    if (options?.colorStart !== undefined) {
      newOptions.colorStart = options.colorStart
    }

    if (options?.colorEnd !== undefined) {
      newOptions.colorEnd = options.colorEnd
    }

    if (options?.colorTrigger !== undefined) {
      newOptions.colorTrigger = options.colorTrigger
    }

    if (options?.parent !== undefined) {
      newOptions.parent = options.parent
    }

    if (options?.indent !== undefined) {
      newOptions.indent = options.indent
    }

    return <IndicatorOptions>newOptions
  }
}
