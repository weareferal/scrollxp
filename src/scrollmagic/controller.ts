import Indicator, { IndicatorGroup } from "./indicator"
import DomUtils, { Offset, CSSProperty } from "./utils/dom"
import Logger from "./utils/logger"
import Type from "./utils/type"
import AnimationUtils from "./utils/animation"
import Scene from "./scene"
import SceneEvent from "./scene-event"
import { Scrollbar } from "smooth-scrollbar/scrollbar"
import { ScrollListener } from "smooth-scrollbar/interfaces"

export enum ScrollDirection {
  Forward = "FORWARD",
  Paused = "PAUSED",
  Reverse = "REVERSE",
}

export interface ControllerIndicators {
  groups?: IndicatorGroup[]
  updateBoundsPositions: (Indicator?) => void
  updateTriggerGroupPositions: (IndicatorGroup?) => void
  updateTriggerGroupLabel: (ControllerIndicators?) => void
}

export interface ControllerInfo {
  isVertical: boolean
  isDocument: boolean
  container: HTMLElement | Window
  size: number
  scrollPos: number
  scrollDirection: ScrollDirection
  smoothScrolling: boolean
}

export interface ControllerOptions {
  container?: HTMLElement | Window | Document
  isVertical?: boolean
  globalSceneOptions?: any
  logLevel?: number
  refreshInterval?: number
  addIndicators?: boolean
  smoothScrolling?: boolean
}

export default class Controller {
  private _scrollPos = 0
  private isDocument = true
  private viewPortSize: number
  private updateScenesOnNextCycle: Scene[] | boolean = false
  private scrollDirection = ScrollDirection.Paused
  private updateTimeout: () => void
  private sceneObjects: Scene[] = []
  private refreshTimeout: number
  private scrollbarListener?: ScrollListener

  // Options
  private isVertical: boolean
  private logLevel: number
  private globalSceneOptions: any
  private refreshInterval: number
  private addIndicators: boolean
  private smoothScrolling: boolean
  public container: HTMLElement | Window

  // Public
  public indicators: ControllerIndicators
  public enabled = true
  public _scrollbar?: Scrollbar

  public static NAMESPACE = "Controller"

  constructor(options?: ControllerOptions) {
    this.setOptions(options)

    // Check ScrollContainer
    // if (!this.container) {
    //   this.log(1, "ERROR creating object " + Controller.NAMESPACE + ": No valid scroll container supplied")
    //   throw Controller.NAMESPACE + " init failed." // cancel
    // }

    // Update container size immediately
    this.viewPortSize = this.getViewportSize()

    // Set event handlers
    this.container.addEventListener("resize", this.onChange.bind(this))
    this.container.addEventListener("scroll", this.onChange.bind(this))

    this.scheduleRefresh()

    this.log(3, "Added new " + Controller.NAMESPACE + " controller")

    // Debug plugin

    this.container.addEventListener("resize", this.handleTriggerPositionChange.bind(this))

    if (!this.isDocument) {
      window.addEventListener("resize", this.handleTriggerPositionChange.bind(this))
      window.addEventListener("scroll", this.handleTriggerPositionChange.bind(this))
    }

    // Update all related bounds containers
    this.container.addEventListener("resize", this.handleBoundsPositionChange.bind(this))
    this.container.addEventListener("scroll", this.handleBoundsPositionChange.bind(this))

    this.indicators = {
      groups: [],
      // Updates the position of the bounds container to aligned to the right for vertical containers and to the bottom for horizontal
      updateBoundsPositions: (specificIndicator?: Indicator) => {
        // Create a group with only one element or use all
        let groups
        if (specificIndicator && specificIndicator.triggerGroup) {
          const indicator = specificIndicator
          if (indicator.triggerGroup) {
            indicator.triggerGroup.members = [specificIndicator]
          }
          groups = [indicator.triggerGroup]
        } else {
          groups = this.indicators.groups
        }

        if (groups) {
          let g = groups.length
          const css: CSSProperty = {}
          const paramPos = this.isVertical ? "left" : "top"
          const edge = this.isVertical
            ? DomUtils.getScrollLeft(this.container) + DomUtils.getWidth(this.container) - Indicator.EDGE_OFFSET
            : DomUtils.getScrollTop(this.container) + DomUtils.getHeight(this.container) - Indicator.EDGE_OFFSET
          let b
          let triggerSize
          let group

          while (g--) {
            // Group loop
            group = groups[g]
            b = group.members.length

            triggerSize = this.isVertical
              ? DomUtils.getWidth(group.element.firstChild)
              : DomUtils.getHeight(group.element.firstChild)

            while (b--) {
              // Indicators loop
              css[paramPos] = edge - triggerSize
              DomUtils.css(group.members[b].bounds, css)
            }
          }
        }
      },
      // Updates the position of the bounds container to aligned to the right for vertical containers and to the bottom for horizontal
      updateTriggerGroupPositions: (specificGroup?: IndicatorGroup) => {
        const groups = specificGroup ? [specificGroup] : this.indicators.groups
        if (groups) {
          const container = this.isDocument ? document.body : this.container
          const containerOffset: Offset = this.isDocument ? { top: 0, left: 0 } : DomUtils.getOffset(container, true)
          const edge = this.isVertical
            ? DomUtils.getWidth(this.container) - Indicator.EDGE_OFFSET
            : DomUtils.getHeight(this.container) - Indicator.EDGE_OFFSET

          let group
          let elem
          let pos
          let elemSize
          let transform

          let i = groups.length
          while (i--) {
            group = groups[i]
            elem = group.element
            pos = group.triggerHook * this.info().size
            elemSize = this.isVertical
              ? DomUtils.getWidth(elem.firstChild.firstChild)
              : DomUtils.getHeight(elem.firstChild.firstChild)
            transform = pos > elemSize ? `translate${this.isVertical ? "Y" : "X"}(-100%)` : ""

            DomUtils.css(elem, {
              top: containerOffset.top + (this.isVertical ? pos : edge - group.members[0].options.indent),
              left: containerOffset.left + (this.isVertical ? edge - group.members[0].options.indent : pos),
            })

            DomUtils.css(elem.firstChild.firstChild, {
              "-ms-transform": transform,
              "-webkit-transform": transform,
              transform: transform,
            })
          }
        }
      },
      // Updates the label for the group to contain the name, if it only has one member
      updateTriggerGroupLabel: (group?: IndicatorGroup) => {
        if (group) {
          const text = `trigger${group.members.length > 1 ? "" : " " + group.members[0].options.name}`
          const elem = group.element.firstChild?.firstChild
          const doUpdate = elem?.textContent !== text

          if (doUpdate) {
            if (elem) {
              elem.textContent = text
            }

            if (this.isVertical) {
              // Bounds position is dependent on text length, so update
              this.indicators.updateBoundsPositions()
            }
          }
        }
      },
    }
  }

  get scrollbar(): Scrollbar | undefined {
    return this._scrollbar
  }

  set scrollbar(newValue: Scrollbar | undefined) {
    if (this._scrollbar && this.scrollbarListener) {
      this._scrollbar.removeListener(this.scrollbarListener)
      this.scrollbarListener = undefined
    } else {
      this.scrollbarListener = this.onChange.bind(this)
      this._scrollbar = newValue
      if (this._scrollbar && this.scrollbarListener) {
        this._scrollbar.addListener(this.scrollbarListener)
      }
    }
  }

  /**
   * Schedule the next execution of the refresh function
   */
  private scheduleRefresh(): void {
    if (this.refreshInterval > 0) {
      this.refreshTimeout = window.setTimeout(this.refresh.bind(this), this.refreshInterval)
    }
  }

  /**
   * Default function to get scroll pos - overwriteable using `Controller.scrollPos(newFunction)`
   */
  private getScrollPos(): number {
    if (this.smoothScrolling && this.scrollbar) {
      return this.isVertical ? this.scrollbar.offset.y : this.scrollbar.offset.x
    }
    return this.isVertical ? DomUtils.getScrollTop(this.container) : DomUtils.getScrollLeft(this.container)
  }

  /**
   * Returns the current viewport Size (width vor horizontal, height for vertical)
   */
  private getViewportSize(): number {
    return this.isVertical ? DomUtils.getHeight(this.container) : DomUtils.getWidth(this.container)
  }

  /**
   * Default function to set scroll pos - overwriteable using `Controller.scrollTo(newFunction)`
   *
   * Made available publicly for pinned mousewheel workaround.
   */
  public setScrollPos(pos: number): void {
    if (this.isVertical) {
      if (this.isDocument) {
        window.scrollTo(DomUtils.getScrollLeft(), pos)
      } else {
        const container = <HTMLElement>this.container
        container.scrollTop = pos
      }
    } else {
      if (this.isDocument) {
        window.scrollTo(pos, DomUtils.getScrollTop())
      } else {
        const container = <HTMLElement>this.container
        container.scrollLeft = pos
      }
    }
  }

  /**
   * Handle updates in cycles instead of on scroll (performance)
   */
  private updateScenes(): void {
    if (this.enabled && this.updateScenesOnNextCycle) {
      // Determine scenes to update
      const scenesToUpdate = Type.isArray(this.updateScenesOnNextCycle)
        ? <Scene[]>this.updateScenesOnNextCycle
        : this.sceneObjects.slice(0)

      // Reset scenes
      this.updateScenesOnNextCycle = false

      // Update scroll pos now instead of onChange, as it might have changed since scheduling (i.e. in-browser smooth scroll)
      const oldScrollPos = this._scrollPos

      this._scrollPos = this.scrollPos()

      const deltaScroll = this._scrollPos - oldScrollPos
      if (deltaScroll !== 0) {
        // scroll position changed?
        this.scrollDirection = deltaScroll > 0 ? ScrollDirection.Forward : ScrollDirection.Reverse
      }

      // Reverse order of scenes if scrolling reverse
      if (this.scrollDirection === ScrollDirection.Reverse) {
        scenesToUpdate.reverse()
      }

      // Update scenes
      scenesToUpdate.forEach((scene, index) => {
        this.log(
          3,
          "Updating Scene " + (index + 1) + "/" + scenesToUpdate.length + " (" + this.sceneObjects.length + " total)",
        )
        scene.update(true)
      })

      if (scenesToUpdate.length === 0 && this.logLevel >= 3) {
        this.log(3, "Updating 0 Scenes (nothing added to controller)")
      }
    }
  }

  /**
   * Initializes rAF callback
   */
  private debounceUpdate() {
    this.updateTimeout = AnimationUtils.rAF(this.updateScenes.bind(this))
  }

  /**
   * Handles Container changes
   */
  private onChange(e?: SceneEvent): void {
    this.log(3, "Event fired causing an update:", e?.type)

    if (e?.type == "resize") {
      // Resize
      this.viewPortSize = this.getViewportSize()
      this.scrollDirection = ScrollDirection.Paused
    }

    // Schedule update
    if (this.updateScenesOnNextCycle !== true) {
      this.updateScenesOnNextCycle = true
      this.debounceUpdate()
    }
  }

  private refresh(): void {
    if (!this.isDocument) {
      // Simulate resize event. Only works for viewport relevant param (performance)
      if (this.viewPortSize != this.getViewportSize()) {
        let resizeEvent
        try {
          resizeEvent = new Event("resize", { bubbles: false, cancelable: false })
        } catch (e) {
          // stupid IE
          resizeEvent = document.createEvent("Event")
          resizeEvent.initEvent("resize", false, false)
        }
        this.container.dispatchEvent(resizeEvent)
      }
    }

    this.sceneObjects.forEach((scene) => {
      // Refresh all scenes
      scene.refresh()
    })

    this.scheduleRefresh()
  }

  /**
   * Send a debug message to the console.
   *
   * @param {...args[]} args - One or more variables that should be passed to the console.
   */
  private log(...args: any[]): void {
    const logLevel = args[0]
    if (this.logLevel >= logLevel) {
      Array.prototype.splice.call(args, 1, 0, `(${Scene.NAMESPACE})`)
      Logger.log.apply(window, args)
    }
  }

  /**
   * Sort scenes in ascending order of their start offset.
   *
   * @param {Scene[]} scenesList - an array of ScrollMagic Scenes that should be sorted
   *
   * @return {Scene[]} The sorted array of Scenes.
   */
  private sortScenes(scenesList: Scene[]): Scene[] {
    if (scenesList.length <= 1) {
      return scenesList
    } else {
      const scenes = scenesList.slice(0)
      scenes.sort(function (a, b) {
        return a.scrollOffset > b.scrollOffset ? 1 : -1
      })
      return scenes
    }
  }

  private setOptions(options?: ControllerOptions): void {
    const newOptions = {
      container: <HTMLElement | Window | Document>window,
      isVertical: true,
      globalSceneOptions: {},
      logLevel: 2,
      refreshInterval: 100,
      addIndicators: false,
      smoothScrolling: false,
    }

    if (options) {
      if (options.container !== undefined) {
        newOptions.container = options.container
      }

      if (options.isVertical !== undefined) {
        newOptions.isVertical = options.isVertical
      }

      if (options.globalSceneOptions !== undefined) {
        newOptions.globalSceneOptions = options.globalSceneOptions
      }

      if (options.logLevel !== undefined) {
        newOptions.logLevel = options.logLevel
      }

      if (options.refreshInterval !== undefined) {
        newOptions.refreshInterval = options.refreshInterval
      }

      if (options.addIndicators !== undefined) {
        newOptions.addIndicators = options.addIndicators
      }

      if (options.smoothScrolling !== undefined) {
        newOptions.smoothScrolling = options.smoothScrolling
      }
    }

    const container = DomUtils.getContainer(newOptions.container)
    this.isDocument = container instanceof Window || container === document.body || !document.body.contains(container)
    if (this.isDocument) {
      this.container = window
    } else if (container instanceof Window) {
      this.container = <Window>container
    } else {
      this.container = <HTMLElement>container
    }

    this.isVertical = newOptions.isVertical
    this.globalSceneOptions = newOptions.globalSceneOptions
    this.logLevel = newOptions.logLevel
    this.refreshInterval = newOptions.refreshInterval
    this.addIndicators = newOptions.addIndicators
    this.smoothScrolling = newOptions.smoothScrolling
  }

  private handleBoundsPositionChange(): void {
    this.indicators.updateBoundsPositions()
  }

  private handleTriggerPositionChange(): void {
    this.indicators.updateTriggerGroupPositions()
  }

  /**
   * ----------------------------------------------------------------
   * Public functions
   * ----------------------------------------------------------------
   */

  /**
   * Add one ore more scene(s) to the controller.
   *
   * This is the equivalent to `Scene.addTo(controller)`.
   *
   * @example
   * // With a previously defined scene
   * controller.addScene(scene)
   *
   * // With a newly created scene.
   * controller.addScene(new Scene({duration : 0}))
   *
   * // Adding multiple scenes
   * controller.addScene([scene, scene2, new Scene({duration : 0})])
   *
   * @param {(Scene|array)} newScene - Scene or Array of Scenes to be added to the controller.
   *
   * @return {Controller} Parent object for chaining.
   */
  public addScene(newScene: Scene | Scene[]): Controller {
    if (Type.isArray(newScene)) {
      const scenes = <Scene[]>newScene
      scenes.forEach((scene) => {
        this.addScene(scene)
      })
    } else {
      const scene = <Scene>newScene

      if (scene.controller !== this) {
        scene.addTo(this)
      } else if (this.sceneObjects.indexOf(scene) < 0) {
        // New scene
        this.sceneObjects.push(scene) // Add to array

        this.sceneObjects = this.sortScenes(this.sceneObjects) // Sort

        scene.on("shift.controller_sort", () => {
          // Resort whenever scene moves
          this.sceneObjects = this.sortScenes(this.sceneObjects)
        })

        // Insert Global defaults.
        for (const key in this.globalSceneOptions) {
          scene.setValue(key, this.globalSceneOptions[key])
        }

        this.log(3, "Adding Scene (now " + this.sceneObjects.length + " total)")
      }

      if (this.addIndicators) {
        scene.addIndicators()
      }
    }
    return this
  }

  /**
   * Remove one ore more scene(s) from the controller.
   *
   * This is the equivalent to `Scene.remove()`.
   *
   * @example
   * // Remove a scene from the controller
   * controller.removeScene(scene)
   *
   * // Remove multiple scenes from the controller
   * controller.removeScene([scene, scene2, scene3])
   *
   * @param {(Scene|Scene[])} Scene - cene or Array of Scenes to be removed from the controller.
   *
   * @returns {Controller} Parent object for chaining.
   */
  public removeScene(oldScene: Scene | Scene[]): Controller {
    if (Type.isArray(oldScene)) {
      const scenes = <Scene[]>oldScene
      scenes.forEach((scene) => {
        this.removeScene(scene)
      })
    } else {
      const scene = <Scene>oldScene
      const index = this.sceneObjects.indexOf(scene)
      if (index > -1) {
        scene.off("shift.controller_sort")
        this.sceneObjects.splice(index, 1)
        this.log(3, "Removing Scene (now " + this.sceneObjects.length + " left)")
        scene.remove()
      }
    }
    return this
  }

  /**
   * Update one ore more scene(s) according to the scroll position of the container.
   * 
   * This is the equivalent to `Scene.update()`.
   * 
   * The update method calculates the scene's start and end position (based on the trigger element, trigger hook, duration and offset) and checks it against the current scroll position of the container.
   * 
   * It then updates the current scene state accordingly (or does nothing, if the state is already correct) – Pins will be set to their correct position and tweens will be updated to their correct progress.
   * 
   * _**Note:** This method gets called constantly whenever Controller detects a change. The only application for you is if you change something outside of the realm of ScrollMagic, like moving the trigger or changing tween parameters._
   * 
   * @example
   * // Update a specific scene on next cycle
   * controller.updateScene(scene)
   *
   * // Update a specific scene immediately
   * controller.updateScene(scene, true)
   *
   * // Update multiple scenes scene on next cycle
   * controller.updateScene([scene1, scene2, scene3])
   *
   * @param {Scene|Scene[]} Scene - Scene or Array of Scenes that is/are supposed to be updated.
   * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next update cycle.  
                        This is useful when changing multiple properties of the scene - this way it will only be updated once all new properties are set (updateScenes).
  * @return {Controller} Parent object for chaining.
  */
  public updateScene(currentScene: Scene | Scene[], immediately?: boolean): Controller {
    if (Type.isArray(currentScene)) {
      const scenes = <Scene[]>currentScene
      scenes.forEach((scene) => {
        this.updateScene(scene, immediately)
      })
    } else {
      const scene = <Scene>currentScene
      if (immediately) {
        scene.update(true)
      } else if (this.updateScenesOnNextCycle !== true) {
        // If _updateScenesOnNextCycle is true, all connected scenes are already scheduled for update
        // Prep array for next update cycle
        this.updateScenesOnNextCycle = this.updateScenesOnNextCycle || []
        if (this.updateScenesOnNextCycle.indexOf(scene) == -1) {
          this.updateScenesOnNextCycle.push(scene)
        }
        this.updateScenesOnNextCycle = this.sortScenes(this.updateScenesOnNextCycle) // Sort
        this.debounceUpdate()
      }
    }
    return this
  }

  /**
   * Updates the controller params and calls updateScene on every scene, that is attached to the controller.
   * 
   * See `Controller.updateScene()` for more information about what this means.
   * 
   * In most cases you will not need this function, as it is called constantly, whenever ScrollMagic detects a state change event, like resize or scroll.
   * 
   * The only application for this method is when ScrollMagic fails to detect these events.
   * 
   * One application is with some external scroll libraries (like iScroll) that move an internal container to a negative offset instead of actually scrolling. In this case the update on the controller needs to be called whenever the child container's position changes.
   * 
   * For this case there will also be the need to provide a custom function to calculate the correct scroll position. See `Controller.scrollPos()` for details.

   * @example
   * // Update the controller on next cycle (saves performance due to elimination of redundant updates)
   * controller.update();
   *
   * // Update the controller immediately
   * controller.update(true);
   *
   * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next update cycle (better performance)
   * @return {Controller} Parent object for chaining.
   */
  public update(immediately?: boolean): Controller {
    this.onChange(new SceneEvent("resize")) // Will update size and set updateScenesOnNextCycle to true

    if (immediately) {
      this.updateScenes()
    }

    return this
  }

  /**
   * Scroll to a numeric scroll offset, a DOM element, the start of a scene or provide an alternate method for scrolling.
   *
   * For vertical controllers it will change the top scroll offset and for horizontal applications it will change the left offset.
   *
   * @example
   * // scroll to an offset of 100
   * controller.scrollTo(100);
   *
   * // scroll to a DOM element
   * controller.scrollTo("#anchor");
   *
   * // scroll to the beginning of a scene
   * var scene = new ScrollMagic.Scene({offset: 200});
   * controller.scrollTo(scene);
   *
   * // define a new scroll position modification function (jQuery animate instead of jump)
   * controller.scrollTo(function (newScrollPos) {
   *	$("html, body").animate({scrollTop: newScrollPos});
   * });
   * controller.scrollTo(100); // call as usual, but the new function will be used instead
   *
   * // define a new scroll function with an additional parameter
   * controller.scrollTo(function (newScrollPos, message) {
   *  console.log(message);
   *	$(this).animate({scrollTop: newScrollPos});
   * });
   * // call as usual, but supply an extra parameter to the defined custom function
   * controller.scrollTo(100, "my message");
   *
   * // define a new scroll function with an additional parameter containing multiple variables
   * controller.scrollTo(function (newScrollPos, options) {
   *  someGlobalVar = options.a + options.b;
   *	$(this).animate({scrollTop: newScrollPos});
   * });
   * // call as usual, but supply an extra parameter containing multiple options
   * controller.scrollTo(100, {a: 1, b: 2});
   *
   * // define a new scroll function with a callback supplied as an additional parameter
   * controller.scrollTo(function (newScrollPos, callback) {
   *	$(this).animate({scrollTop: newScrollPos}, 400, "swing", callback);
   * });
   * // call as usual, but supply an extra parameter, which is used as a callback in the previously defined custom scroll function
   * controller.scrollTo(100, function() {
   *	console.log("scroll has finished.");
   * });
   *
   * @param {mixed} scrollTarget - The supplied argument can be one of these types:
   * 1. `number` -> The container will scroll to this new scroll offset.
   * 2. `string` or `object` -> Can be a selector or a DOM object.
   *  The container will scroll to the position of this element.
   * 3. `ScrollMagic Scene` -> The container will scroll to the start of this scene.
   * 4. `function` -> This function will be used for future scroll position modifications.
   *
   *  This provides a way for you to change the behaviour of scrolling and adding new behaviour like animation. The function receives the new scroll position as a parameter and a reference to the container element using `this`.
   *
   *  It may also optionally receive an optional additional parameter (see below)
   *
   *  _**NOTE:**
   *  All other options will still work as expected, using the new function to scroll._
   *
   * @param {mixed} [additionalParameter] - If a custom scroll function was defined (see above 4.), you may want to supply additional parameters to it, when calling it. You can do this using this parameter – see examples for details. Please note, that this parameter will have no effect, if you use the default scrolling function.
   *
   * @returns {Controller} Parent object for chaining.
   */
  scrollTo(scrollTarget: number | string | HTMLElement | ((number) => void), additionalParameter?: any): Controller {
    if (Type.isNumber(scrollTarget)) {
      // Execute
      this.setScrollPos.call(this.container, <number>scrollTarget, additionalParameter)
    } else if (scrollTarget instanceof Scene) {
      const scene = <Scene>scrollTarget
      // Scroll to scene
      if (scene.controller === this) {
        // Check if the controller is associated with this scene
        this.scrollTo(scene.scrollOffset, additionalParameter)
      } else {
        this.log(2, "scrollTo(): The supplied scene does not belong to this controller. Scroll cancelled.", scene)
      }
    } else if (Type.isFunction(scrollTarget)) {
      // Assign new scroll function
      const func = <(number) => void>scrollTarget
      this.setScrollPos = func
    } else {
      // Scroll to element
      let elem = <HTMLElement>DomUtils.getElements(<HTMLElement | string>scrollTarget)[0]
      if (elem) {
        // If parent is pin spacer, use spacer position instead so correct start position is returned for pinned elements.
        let parent = <HTMLElement>elem.parentNode
        while (parent.hasAttribute(Scene.PIN_SPACER_ATTRIBUTE)) {
          parent = <HTMLElement>elem.parentNode
          elem = parent
        }

        const param = this.isVertical ? "top" : "left" // Which param is of interest ?
        const containerOffset = DomUtils.getOffset(this.container) // Container position is needed because element offset is returned in relation to document, not in relation to container.
        const elementOffset = DomUtils.getOffset(<HTMLElement>elem)

        if (!this.isDocument) {
          // Container is not the document root, so substract scroll Position to get correct trigger element position relative to scrollcontent
          containerOffset[param] -= this.scrollPos()
        }

        this.scrollTo(elementOffset[param] - containerOffset[param], additionalParameter)
      } else {
        this.log(2, "scrollTo(): The supplied argument is invalid. Scroll cancelled.", scrollTarget)
      }
    }
    return this
  }

  /**
   * **Get** the current scrollPosition or **Set** a new method to calculate it.
   * -> **GET**:
   * When used as a getter this function will return the current scroll position.
   * To get a cached value use Controller.info("scrollPos"), which will be updated in the update cycle.
   * For vertical controllers it will return the top scroll offset and for horizontal applications it will return the left offset.
   *
   * -> **SET**:
   * When used as a setter this method prodes a way to permanently overwrite the controller's scroll position calculation.
   * A typical usecase is when the scroll position is not reflected by the containers scrollTop or scrollLeft values, but for example by the inner offset of a child container.
   * Moving a child container inside a parent is a commonly used method for several scrolling frameworks, including iScroll.
   * By providing an alternate calculation function you can make sure ScrollMagic receives the correct scroll position.
   * Please also bear in mind that your function should return y values for vertical scrolls an x for horizontals.
   *
   * To change the current scroll position please use `Controller.scrollTo()`.
   * @public
   *
   * @example
   * // get the current scroll Position
   * var scrollPos = controller.scrollPos();
   *
   * // set a new scroll position calculation method
   * controller.scrollPos(function () {
   *	return this.info("vertical") ? -mychildcontainer.y : -mychildcontainer.x
   * });
   *
   * @param {function} [scrollPosMethod] - The function to be used for the scroll position calculation of the container.
   * @returns {(number|Controller)} Current scroll position or parent object for chaining.
   */
  // TODO: Refactor this, it's horrible
  public scrollPos(...args: any[]): number {
    if (args.length === 0) {
      return this.getScrollPos()
    } else if (Type.isFunction(args[0])) {
      this.getScrollPos = <() => number>args[0]
      return 1
    } else {
      this.log(
        2,
        "Provided value for method 'scrollPos' is not a function. To change the current scroll position use 'scrollTo()'.",
      )
      return 0
    }
  }

  /**
   * Get all infos or one in particular about the controller.
   *
   * @example
   * // Returns the current scroll position (number)
   * var scrollPos = controller.info("scrollPos");
   *
   * // Returns all infos as an object
   * var infos = controller.info();
   *
   * @param {string} [about] - If passed only this info will be returned instead of an object containing all.  
                 Valid options are:
                ** `"size"` => the current viewport size of the container
                ** `"isVertical"` => true if vertical scrolling, otherwise false
                ** `"scrollPos"` => the current scroll position
                ** `"scrollDirection"` => the last known direction of the scroll
                ** `"container"` => the container element
                ** `"isDocument"` => true if container element is the document.
  * @returns {(ControllerInfo)} The requested info(s).
  */
  public info(): ControllerInfo {
    return {
      size: this.viewPortSize,
      isVertical: this.isVertical,
      isDocument: this.isDocument,
      container: this.container,
      scrollPos: this._scrollPos,
      scrollDirection: this.scrollDirection,
      smoothScrolling: this.smoothScrolling,
    }
  }

  /**
   * Destroy the Controller, all Scenes and everything.
   *
   * @example
   * // Without resetting the scenes
   * controller = controller.destroy()
   *
   * // With scene reset
   * controller = controller.destroy(true)
   *
   * @param {boolean} [resetScenes=false] - If `true` the pins and tweens (if existent) of all scenes will be reset.
   *
   * @returns {null} Null to unset handler variables.
   */
  public destroy(resetScenes?: boolean): null {
    this.container.removeEventListener("resize", this.handleTriggerPositionChange.bind(this))

    if (!this.isDocument) {
      window.removeEventListener("resize", this.handleTriggerPositionChange.bind(this))
      window.removeEventListener("scroll", this.handleTriggerPositionChange.bind(this))
    }

    this.container.removeEventListener("resize", this.handleBoundsPositionChange.bind(this))
    this.container.removeEventListener("scroll", this.handleBoundsPositionChange.bind(this))

    window.clearTimeout(this.refreshTimeout)

    let i = this.sceneObjects.length

    while (i--) {
      this.sceneObjects[i].destroy(resetScenes)
    }

    this.container.removeEventListener("resize", this.onChange.bind(this))
    this.container.removeEventListener("scroll", this.onChange.bind(this))

    AnimationUtils.cAF(this.updateTimeout)

    this.log(3, "Destroyed " + Controller.NAMESPACE + " (reset: " + (resetScenes ? "true" : "false") + ")")

    return null
  }
}
