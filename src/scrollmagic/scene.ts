import Controller, { ControllerInfo, ScrollDirection } from "./controller"
import Logger from "./utils/logger"
import SceneEvent, { SceneEventVars } from "./scene-event"
import DomUtils, { OffsetParam, CSSProperty } from "./utils/dom"
import { TweenMax, TimelineMax } from "gsap"
import Type from "./utils/type"
import Indicator, { IndicatorOptions } from "./indicator"

export interface SceneOptions {
  duration?: number | string | (() => number)
  offset?: number
  triggerElement?: HTMLElement
  triggerHook?: number | string
  reverse?: boolean
  logLevel?: number
  tweenChanges?: boolean
}

interface SceneListener {
  namespace: string
  callback: (e?: SceneEventVars) => void
}

interface SceneListeners {
  [eventName: string]: SceneListener[]
}

interface ScrollOffset {
  start: number
  end: number
}

export enum State {
  Before,
  During,
  After,
}

interface PinOptions {
  spacer: HTMLElement
  inFlow: boolean
  pushFollowers: boolean
  relSize: {
    width?: boolean
    height?: boolean
    autoFullWidth?: boolean
  }
}

export default class Scene {
  // Getters/Setters
  private _controller: Controller
  private _triggerPosition = 0
  private _enabled = true
  private _progress = 0

  // Options
  private _duration: number
  private _offset: number
  private _triggerElement?: HTMLElement
  private _triggerHook: number
  private _reverse: boolean
  private _logLevel: number
  private _tweenChanges: boolean

  private durationUpdateMethod?: () => number
  private listeners: SceneListeners = {}
  private state: State = State.Before

  private _scrollOffset: ScrollOffset = { start: 0, end: 0 }

  // Pins
  private pin?: HTMLElement
  private pinOptions?: PinOptions

  // Class toggle
  private cssClasses?: string[]
  private cssClassElems: HTMLElement[] = []

  // Animation plugin
  private tween?: TimelineMax
  private easing = false

  // Debug plugin
  private autoIndex = 0
  private indicator?: Indicator

  public static NAMESPACE = "Scene"
  public static PIN_SPACER_ATTRIBUTE = "data-scrollmagic-pin-spacer"

  constructor(options: SceneOptions) {
    this.setOptions(options)

    // Set event listeners
    this.on("change.internal", (e) => {
      if (e?.what !== "logLevel" && e?.what !== "tweenChanges") {
        // No need for a scene update scene with these options...
        if (e?.what === "triggerElement") {
          this.updateTriggerElementPosition()
        } else if (e?.what === "reverse") {
          // The only property left that may have an impact on the current scene state. Everything else is handled by the shift event.
          this.update()
        }
      }
    }).on("shift.internal", () => {
      this.updateScrollOffset()
      this.update() // Update scene to reflect new position
    })

    // Pinning feature
    this.on("shift.internal", (e) => {
      const durationChanged = e?.reason === "duration"

      // If [duration changed after a scene (inside scene progress updates pin position)] or [duration is 0, we are in pin phase and some other value changed].
      if ((this.state === State.After && durationChanged) || (this.state === State.During && this._duration === 0)) {
        this.updatePinState()
      }

      if (durationChanged) {
        this.updatePinDimensions()
      }
    })
      .on("progress.internal", () => {
        this.updatePinState()
      })
      .on("add.internal", () => {
        this.updatePinDimensions()
      })
      .on("destroy.internal", (e) => {
        this.removePin(e?.reset)
      })

    // Class toggle feature
    this.on("destroy.internal", (e) => {
      this.removeClassToggle(e?.reset)
    })

    // Animation plugin
    this.on("progress.plugin_gsap", () => {
      this.updateTweenProgress()
    }).on("destroy.plugin_gsap", (e) => {
      this.removeTween(e?.reset)
    })
  }

  get controller(): Controller {
    return this._controller
  }

  set controller(newValue: Controller) {
    this._controller = newValue
  }

  get duration(): number {
    if (this.durationUpdateMethod) {
      this._duration = this.durationUpdateMethod()
    }
    return this._duration
  }

  set duration(newValue: number) {
    const changed = this._duration !== newValue

    this._duration = newValue
    this.durationUpdateMethod = undefined

    if (changed) {
      this.trigger("change", { what: "duration", newValue: newValue })
      this.trigger("shift", { reason: "duration" })
    }
  }

  get offset(): number {
    return this._offset
  }

  set offset(newValue: number) {
    const changed = this._offset !== newValue

    this._offset = newValue

    if (changed) {
      this.trigger("change", { what: "offset", newValue: newValue })
      this.trigger("shift", { reason: "offset" })
    }
  }

  get triggerElement(): HTMLElement | undefined {
    return this._triggerElement
  }

  set triggerElement(newValue: HTMLElement | undefined) {
    const changed = this._triggerElement !== newValue

    this._triggerElement = newValue

    if (changed) {
      this.trigger("change", { what: "triggerElement", newValue: newValue })
    }
  }

  get triggerHook(): number {
    return this._triggerHook
  }

  set triggerHook(newValue: number) {
    const changed = this._triggerHook !== newValue

    this._triggerHook = newValue

    if (changed) {
      this.trigger("change", { what: "triggerHook", newValue: newValue })
      this.trigger("shift", { reason: "triggerHook" })
    }
  }

  get reverse(): boolean {
    return this._reverse
  }

  set reverse(newValue: boolean) {
    const changed = this._reverse !== newValue

    this._reverse = newValue

    if (changed) {
      this.trigger("change", { what: "reverse", newValue: newValue })
    }
  }

  get logLevel(): number {
    return this._logLevel
  }

  set logLevel(newValue: number) {
    const changed = this._logLevel !== newValue

    this._logLevel = newValue

    if (changed) {
      this.trigger("change", { what: "logLevel", newValue: newValue })
    }
  }

  get tweenChanges(): boolean {
    return this._tweenChanges
  }

  set tweenChanges(newValue: boolean) {
    const changed = this._tweenChanges !== newValue

    this._tweenChanges = newValue

    if (changed) {
      this.trigger("tweenChanges", { what: "tweenChanges", newValue: newValue })
    }
  }

  /**
   * Get the current enabled state of the scene.
   *
   * @example
   * let enabled = scene.enabled
   *
   * @returns {boolean} Current enabled state.
   */
  get enabled(): boolean {
    return this._enabled
  }

  /**
   * Set the current enabled state of the scene.
   *
   * This can be used to disable this scene without removing or destroying it.
   *
   * @example
   * // Disable the scene
   * scene.enabled(false)
   *
   * @param {boolean} [newValue] - The new enabled state of the scene `true` or `false`.
   * @returns {Scene} Parent object for chaining.
   */
  set enabled(newValue: boolean) {
    const changed = this._enabled !== newValue

    this._enabled = newValue

    if (changed) {
      this.update(true)
    }
  }

  /**
   * Get the scene's progress.
   *
   * @example
   * // Get the current scene progress
   * let progress = scene.progress
   *
   * @returns {number} - Current scene progress.
   */
  get progress(): number {
    return this._progress
  }

  /**
   * Set the scene's progress.
   *
   * Usually it shouldn't be necessary to use this, as it is set automatically by scene.update().
   *
   * The order in which the events are fired depends on the duration of the scene:
   *   1. Scenes with `duration == 0`:
   *     Scenes that have no duration by definition have no ending. Thus the `end` event will never be fired.
   *
   *     When the trigger position of the scene is passed the events are always fired in this order:
   *    `enter`, `start`, `progress` when scrolling forward and `progress`, `start`, `leave` when scrolling in reverse
   *
   *   2. Scenes with `duration > 0`:
   *     Scenes with a set duration have a defined start and end point.
   *
   *     When scrolling past the start position of the scene it will fire these events in this order:
   *     `enter`, `start`, `progress`
   *
   *     When continuing to scroll and passing the end point it will fire these events:
   *     `progress`, `end`, `leave`
   *
   *     When reversing through the end point these events are fired:
   *     `enter`, `end`, `progress`
   *
   *     And when continuing to scroll past the start position in reverse it will fire:
   *     `progress`, `start`, `leave`
   *
   *     In between start and end the `progress` event will be called constantly, whenever the progress changes.
   *
   * In short:
   *   `enter` events will always trigger **before** the progress update and `leave` envents will trigger **after** the progress update.
   *   `start` and `end` will always trigger at their respective position.
   *
   * Please review the event descriptions for details on the events and the event object that is passed to the callback.
   *
   * @fires {@link Scene.enter}
   * @fires {@link Scene.start}
   * @fires {@link Scene.progress}
   * @fires {@link Scene.end}
   * @fires {@link Scene.leave}
   *
   * @example
   * // Set new scene progress
   * scene.progress = 0.3
   *
   * @param {number} [newValue] - The new progress value of the scene `[0-1]`.
   */
  set progress(newValue: number) {
    // this._progress = newValue

    let doUpdate = false
    const oldState = this.state
    const scrollDirection = this.controller ? this.controller.info().scrollDirection : ScrollDirection.Paused
    const reverseOrForward = this._reverse || newValue >= this._progress

    if (this._duration === 0) {
      // Zero duration scenes
      doUpdate = this._progress != newValue
      this._progress = newValue < 1 && reverseOrForward ? 0 : 1
      this.state = this._progress === 0 ? State.Before : State.During
    } else {
      // Scenes with start and end
      if (newValue < 0 && this.state !== State.Before && reverseOrForward) {
        // Go back to initial state
        this._progress = 0
        this.state = State.Before
        doUpdate = true
      } else if (newValue >= 0 && newValue < 1 && reverseOrForward) {
        this._progress = newValue
        this.state = State.During
        doUpdate = true
      } else if (newValue >= 1 && this.state !== State.After) {
        this._progress = 1
        this.state = State.After
        doUpdate = true
      } else if (this.state === State.During && !reverseOrForward) {
        this.updatePinState() // In case we scrolled backwards mid-scene and reverse is disabled => update the pin position, so it doesn't move back as well.
      }
    }

    // Fire events
    if (doUpdate) {
      const eventVars = { progress: this._progress, state: this.state, scrollDirection: scrollDirection }

      const stateChanged = this.state != oldState

      if (stateChanged) {
        // Enter events
        if (oldState !== State.During) {
          this.trigger("enter", eventVars)
          this.trigger(oldState === State.Before ? "start" : "end", eventVars)
        }
      }

      this.trigger("progress", eventVars)

      if (stateChanged) {
        // Leave events
        if (this.state !== State.During) {
          this.trigger(this.state === State.Before ? "start" : "end", eventVars)
          this.trigger("leave", eventVars)
        }
      }
    }
  }

  /**
   * Get the current scroll offset for the start of the scene.
   *
   * Mind, that the scrollOffset is related to the size of the container, if `triggerHook` is bigger than `0` (or `"onLeave"`).
   *
   * This means, that resizing the container or changing the `triggerHook` will influence the scene's start offset.
   *
   * @example
   * // Get the current scroll offset for the start and end of the scene.
   * let start = scene.scrollOffset
   * let end = scene.scrollOffset + scene.duration
   * console.log("the scene starts at", start, "and ends at", end)
   *
   * @returns {number} The scroll offset (of the container) at which the scene will trigger. Y value for vertical and X value for horizontal scrolls.
   */
  get scrollOffset(): number {
    return this._scrollOffset.start
  }

  /**
   * **Get** the trigger position of the scene (including the value of the `offset` option).
   * @method ScrollMagic.Scene#triggerPosition
   * @example
   * // Get the scene's trigger position
   * let triggerPosition = scene.triggerPosition
   *
   * @returns {number} Start position of the scene. Top position value for vertical and left position value for horizontal scrolls.
   */
  get triggerPosition(): number {
    let pos = this.offset // The offset is the basis
    if (this.controller) {
      // Get the trigger position
      if (this.triggerElement) {
        // Element as trigger
        pos += this._triggerPosition
      } else {
        // Return the height of the triggerHook to start at the beginning
        pos += this.controller.info().size * this.triggerHook
      }
    }
    return pos
  }

  /*
   * ----------------------------------------------------------------
   * Event Management
   * ----------------------------------------------------------------
   */

  /**
   * Scene start event.
   * Fires whenever the scroll position its the starting point of the scene.
   * It will also fire when scrolling back up going over the start position of the scene. If you want something to happen only when scrolling down/right, use the scrollDirection parameter passed to the callback.
   *
   * For details on this event and the order in which it is fired, please review the {@link Scene.progress} method.
   *
   * @event ScrollMagic.Scene#start
   *
   * @example
   * scene.on("start", function (event) {
   * 	console.log("Hit start point of scene.");
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {number} event.progress - Reflects the current progress of the scene
   * @property {string} event.state - The current state of the scene `"BEFORE"` or `"DURING"`
   * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
   */
  /**
   * Scene end event.
   * Fires whenever the scroll position its the ending point of the scene.
   * It will also fire when scrolling back up from after the scene and going over its end position. If you want something to happen only when scrolling down/right, use the scrollDirection parameter passed to the callback.
   *
   * For details on this event and the order in which it is fired, please review the {@link Scene.progress} method.
   *
   * @event ScrollMagic.Scene#end
   *
   * @example
   * scene.on("end", function (event) {
   * 	console.log("Hit end point of scene.");
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {number} event.progress - Reflects the current progress of the scene
   * @property {string} event.state - The current state of the scene `"DURING"` or `"AFTER"`
   * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
   */
  /**
   * Scene enter event.
   * Fires whenever the scene enters the "DURING" state.
   * Keep in mind that it doesn't matter if the scene plays forward or backward: This event always fires when the scene enters its active scroll timeframe, regardless of the scroll-direction.
   *
   * For details on this event and the order in which it is fired, please review the {@link Scene.progress} method.
   *
   * @event ScrollMagic.Scene#enter
   *
   * @example
   * scene.on("enter", function (event) {
   * 	console.log("Scene entered.");
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {number} event.progress - Reflects the current progress of the scene
   * @property {string} event.state - The current state of the scene - always `"DURING"`
   * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
   */
  /**
   * Scene leave event.
   * Fires whenever the scene's state goes from "DURING" to either "BEFORE" or "AFTER".
   * Keep in mind that it doesn't matter if the scene plays forward or backward: This event always fires when the scene leaves its active scroll timeframe, regardless of the scroll-direction.
   *
   * For details on this event and the order in which it is fired, please review the {@link Scene.progress} method.
   *
   * @event ScrollMagic.Scene#leave
   *
   * @example
   * scene.on("leave", function (event) {
   * 	console.log("Scene left.");
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {number} event.progress - Reflects the current progress of the scene
   * @property {string} event.state - The current state of the scene `"BEFORE"` or `"AFTER"`
   * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
   */
  /**
   * Scene update event.
   * Fires whenever the scene is updated (but not necessarily changes the progress).
   *
   * @event ScrollMagic.Scene#update
   *
   * @example
   * scene.on("update", function (event) {
   * 	console.log("Scene updated.");
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {number} event.startPos - The starting position of the scene (in relation to the conainer)
   * @property {number} event.endPos - The ending position of the scene (in relation to the conainer)
   * @property {number} event.scrollPos - The current scroll position of the container
   */
  /**
   * Scene progress event.
   * Fires whenever the progress of the scene changes.
   *
   * For details on this event and the order in which it is fired, please review the {@link Scene.progress} method.
   *
   * @event ScrollMagic.Scene#progress
   *
   * @example
   * scene.on("progress", function (event) {
   * 	console.log("Scene progress changed to " + event.progress);
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {number} event.progress - Reflects the current progress of the scene
   * @property {string} event.state - The current state of the scene `"BEFORE"`, `"DURING"` or `"AFTER"`
   * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
   */
  /**
   * Scene change event.
   * Fires whenvever a property of the scene is changed.
   *
   * @event ScrollMagic.Scene#change
   *
   * @example
   * scene.on("change", function (event) {
   * 	console.log("Scene Property \"" + event.what + "\" changed to " + event.newval);
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {string} event.what - Indicates what value has been changed
   * @property {mixed} event.newval - The new value of the changed property
   */
  /**
   * Scene shift event.
   * Fires whenvever the start or end **scroll offset** of the scene change.
   * This happens explicitely, when one of these values change: `offset`, `duration` or `triggerHook`.
   * It will fire implicitly when the `triggerElement` changes, if the new element has a different position (most cases).
   * It will also fire implicitly when the size of the container changes and the triggerHook is anything other than `onLeave`.
   *
   * @event ScrollMagic.Scene#shift
   * @since 1.1.0
   *
   * @example
   * scene.on("shift", function (event) {
   * 	console.log("Scene moved, because the " + event.reason + " has changed.)");
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {string} event.reason - Indicates why the scene has shifted
   */
  /**
   * Scene destroy event.
   * Fires whenvever the scene is destroyed.
   * This can be used to tidy up custom behaviour used in events.
   *
   * @event ScrollMagic.Scene#destroy
   * @since 1.1.0
   *
   * @example
   * scene.on("enter", function (event) {
   *        // add custom action
   *        $("#my-elem").left("200");
   *      })
   *      .on("destroy", function (event) {
   *        // reset my element to start position
   *        if (event.reset) {
   *          $("#my-elem").left("0");
   *        }
   *      });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {boolean} event.reset - Indicates if the destroy method was called with reset `true` or `false`.
   */
  /**
   * Scene add event.
   * Fires when the scene is added to a controller.
   * This is mostly used by plugins to know that change might be due.
   *
   * @event ScrollMagic.Scene#add
   * @since 2.0.0
   *
   * @example
   * scene.on("add", function (event) {
   * 	console.log('Scene was added to a new controller.');
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   * @property {boolean} event.controller - The controller object the scene was added to.
   */
  /**
   * Scene remove event.
   * Fires when the scene is removed from a controller.
   * This is mostly used by plugins to know that change might be due.
   *
   * @event ScrollMagic.Scene#remove
   * @since 2.0.0
   *
   * @example
   * scene.on("remove", function (event) {
   * 	console.log('Scene was removed from its controller.');
   * });
   *
   * @property {object} event - The event Object passed to each callback
   * @property {string} event.type - The name of the event
   * @property {Scene} event.target - The Scene object that triggered this event
   */

  /**
   * Add one ore more event listener.
   *
   * The callback function will be fired at the respective event, and an object containing relevant data will be passed to the callback.
   *
   * @example
   * function callback (event) {
   *   console.log("Event fired! (" + event.type + ")");
   * }
   *
   * // Add listeners
   * scene.on("change update progress start end enter leave", callback);
   *
   * @param {string} names - The name or names of the event the callback should be attached to.
   * @param {function} callback - A function that should be executed, when the event is dispatched. An event object will be passed to the callback.
   *
   * @returns {Scene} Parent object for chaining.
   */
  public on(names: string, callback: (e?: SceneEventVars) => void): Scene {
    const allNames = names.trim().split(" ")

    allNames.forEach((name) => {
      const parts = name.split(".")

      const eventName = parts[0]
      const namespace = parts[1]

      if (this.listeners && eventName !== "*") {
        // Disallow wildcards
        if (!this.listeners[eventName]) {
          this.listeners[eventName] = []
        }
        this.listeners[eventName].push({
          namespace: namespace || "",
          callback: callback,
        })
      }
    })

    return this
  }

  /**
   * Remove one or more event listener.
   *
   * @example
   * function callback (event) {
   *   console.log("Event fired! (" + event.type + ")");
   * }
   *
   * // Remove listeners
   * scene.off("change update", callback);
   *
   * @param {string} names - The name or names of the event that should be removed.
   * @param {function} [callback] - A specific callback function that should be removed. If none is passed all callbacks to the event listener will be removed.
   *
   * @returns {Scene} Parent object for chaining.
   */
  public off(names: string, callback?: (e?: SceneEventVars) => void): Scene {
    const allNames = names.trim().split(" ")

    allNames.forEach((name) => {
      const parts = name.split(".")

      const eventName = parts[0]
      const namespace = parts[1] || ""

      const removeList = eventName === "*" ? (this.listeners ? Object.keys(this.listeners) : []) : [eventName]

      removeList.forEach((remove) => {
        const list = (this.listeners ? this.listeners[remove] : []) || []

        let i = list.length
        while (i--) {
          const listener = list[i]
          if (
            listener &&
            (namespace === listener.namespace || namespace === "*") &&
            (!callback || callback == listener.callback)
          ) {
            list.splice(i, 1)
          }
        }

        if (!list.length && this.listeners) {
          delete this.listeners[remove]
        }
      })
    })

    return this
  }

  /**
   * Add the scene to a controller.
   *
   * This is the equivalent to `Controller.addScene(scene)`.
   *
   * @example
   * // Add a scene to a Controller
   * scene.addTo(controller)
   *
   * @param {Controller} controller - The controller to which the scene should be added.
   *
   * @returns {Scene} Parent object for chaining.
   */
  public addTo(controller: Controller): Scene {
    if (this._controller != controller) {
      // New controller
      if (this._controller) {
        // Was associated to a different controller before, so remove it...
        this._controller.removeScene(this)
      }

      this._controller = controller

      // this.validateOption()

      this.updateDuration(true)

      this.updateTriggerElementPosition(true)

      this.updateScrollOffset()

      this._controller.info().container.addEventListener("resize", this.onContainerResize.bind(this))

      this._controller.addScene(this)

      this.trigger("add", { controller: this._controller })

      this.log(3, "Added " + Scene.NAMESPACE + " to controller")

      this.update()
    }

    return this
  }

  /**
   * Remove the scene from the controller.
   *
   * This is the equivalent to `Controller.removeScene(scene)`.
   *
   * The scene will not be updated anymore until you readd it to a controller.
   *
   * To remove the pin or the tween you need to call removeTween() or removePin() respectively.
   *
   * @example
   * // Remove the scene from its controller
   * scene.remove()
   *
   * @returns {Scene} Parent object for chaining.
   */
  public remove(): Scene {
    if (this.controller) {
      this.controller.info().container.removeEventListener("resize", this.onContainerResize.bind(this))

      const tmpParent = this.controller

      // this.controller = undefined

      tmpParent.removeScene(this)

      this.trigger("remove")

      this.log(3, "Removed " + Scene.NAMESPACE + " from controller")
    }
    return this
  }

  /**
   * Destroy the scene and everything.
   *
   * @example
   * // Destroy the scene without resetting the pin and tween to their initial positions
   * scene = scene.destroy()
   *
   * // Destroy the scene and reset the pin and tween
   * scene = scene.destroy(true)
   *
   * @param {boolean} [reset=false] - If `true` the pin and tween (if existent) will be reset.
   *
   * @returns {null} Null to unset handler variables.
   */
  public destroy(reset?: boolean): null {
    this.trigger("destroy", { reset: reset })
    this.remove()
    this.off("*.*")
    this.log(3, "destroyed " + Scene.NAMESPACE + " (reset: " + (reset ? "true" : "false") + ")")
    return null
  }

  /**
   * Updates the Scene to reflect the current state.
   *
   * This is the equivalent to `Controller.updateScene(scene, immediately)`.
   *
   * The update method calculates the scene's start and end position (based on the trigger element, trigger hook, duration and offset) and checks it against the current scroll position of the container.
   * It then updates the current scene state accordingly (or does nothing, if the state is already correct) – Pins will be set to their correct position and tweens will be updated to their correct progress.
   *
   * This means an update doesn't necessarily result in a progress change. The `progress` event will be fired if the progress has indeed changed between this update and the last.
   *
   * _**NOTE:** This method gets called constantly whenever ScrollMagic detects a change. The only application for you is if you change something outside of the realm of ScrollMagic, like moving the trigger or changing tween parameters._
   *
   * @example
   * // Update the scene on next tick
   * scene.update();
   *
   * // Update the scene immediately
   * scene.update(true);
   *
   * @fires Scene.update
   *
   * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next update cycle (better performance).
   * @returns {Scene} Parent object for chaining.
   */
  public update(immediately?: boolean): Scene {
    if (this.controller) {
      if (immediately) {
        if (this.controller.enabled && this._enabled) {
          const scrollPos = this.controller.info().scrollPos

          let newProgress: number

          if (this._duration > 0) {
            newProgress = (scrollPos - this._scrollOffset.start) / (this._scrollOffset.end - this._scrollOffset.start)
          } else {
            newProgress = scrollPos >= this._scrollOffset.start ? 1 : 0
          }

          this.trigger("update", {
            startPos: this._scrollOffset.start,
            endPos: this._scrollOffset.end,
            scrollPos: scrollPos,
          })

          this.progress = newProgress
        } else if (this.pin && this.state === State.During) {
          this.updatePinState(true) // Unpin in position
        }
      } else {
        this.controller.updateScene(this, false)
      }
    }
    return this
  }

  /**
   * Updates dynamic scene variables like the trigger element position or the duration.
   *
   * This method is automatically called in regular intervals from the controller. See {@link Controller} option `refreshInterval`.
   *
   * You can call it to minimize lag, for example when you intentionally change the position of the triggerElement.
   * If you don't it will simply be updated in the next refresh interval of the container, which is usually sufficient.
   *
   * @example
   * scene = new Scene({triggerElement: "#trigger"});
   *
   * // Change the position of the trigger
   * $("#trigger").css("top", 500)
   *
   * // Immediately let the scene know of this change
   * scene.refresh()
   *
   * @fires {@link Scene.shift}, if the trigger element position or the duration changed
   * @fires {@link Scene.change}, if the duration changed
   *
   * @returns {Scene} Parent object for chaining.
   */
  public refresh(): Scene {
    this.updateDuration()
    this.updateTriggerElementPosition()
    // Update trigger element position
    return this
  }

  /**
   * Pin an element for the duration of the scene.
   * 
   * If the scene duration is 0 the element will only be unpinned, if the user scrolls back past the start position.
   * 
   * Make sure only one pin is applied to an element at the same time.
   * 
   * An element can be pinned multiple times, but only successively.
   * 
   * _**NOTE:** The option `pushFollowers` has no effect, when the scene duration is 0._
   * 
   * @example
   * // Pin element and push all following elements down by the amount of the pin duration.
   * scene.setPin("#pin");
   *
   * // Pin element and keeping all following elements in their place. The pinned element will move past them.
   * scene.setPin("#pin", {pushFollowers: false});
   *
   * @param {(string|HTMLElement)} element - A Selector targeting an element or a DOM object that is supposed to be pinned.
   * @param {object} [settings] - settings for the pin
   * @param {boolean} [settings.pushFollowers=true] - If `true` following elements will be "pushed" down for the duration of the pin, if `false` the pinned element will just scroll past them.  
                             Ignored, when duration is `0`.
  * @param {string} [settings.spacerClass="scrollmagic-pin-spacer"] - Classname of the pin spacer element, which is used to replace the element.
  *
  * @returns {Scene} Parent object for chaining.
  */
  public setPin(element: HTMLElement | string, pushFollowers?: boolean): Scene {
    // Default push followers = true
    pushFollowers = pushFollowers !== undefined ? pushFollowers : true

    // Validate Element
    element = <HTMLElement>DomUtils.getElements(element)[0]
    if (!element) {
      this.log(1, "ERROR calling method 'setPin()': Invalid pin element supplied.")
      return this // cancel
    } else if (DomUtils.css(element, "position") === "fixed") {
      this.log(1, "ERROR calling method 'setPin()': Pin does not work with elements that are positioned 'fixed'.")
      return this // cancel
    }

    if (this.pin) {
      // Preexisting pin?
      if (this.pin === element) {
        // Same pin we already have -> do nothing
        return this // cancel
      } else {
        // Kill old pin
        this.removePin()
      }
    }
    this.pin = element

    const parentDisplay = (<HTMLElement>this.pin.parentNode)?.style.display
    const boundsParams = [
      "top",
      "left",
      "bottom",
      "right",
      "margin",
      "marginLeft",
      "marginRight",
      "marginTop",
      "marginBottom",
    ]

    if (this.pin.parentElement) {
      this.pin.parentElement.style.display = "none" // Hack start to force css to return stylesheet values instead of calculated px values.
    }

    const inFlow = DomUtils.css(this.pin, "position") != "absolute"
    const pinCSS = <CSSProperty>DomUtils.css(this.pin, boundsParams.concat(["display"]))
    const sizeCSS = DomUtils.css(this.pin, ["width", "height"])

    if (this.pin.parentElement) {
      this.pin.parentElement.style.display = parentDisplay // Hack end
    }

    if (!inFlow && pushFollowers) {
      this.log(2, "WARNING: If the pinned element is positioned absolutely pushFollowers will be disabled.")
      pushFollowers = false
    }

    // Create spacer and insert
    const spacer = this.pin.parentNode?.insertBefore(document.createElement("div"), this.pin)
    const spacerCSS = DomUtils.extend(pinCSS, {
      position: inFlow ? "relative" : "absolute",
      boxSizing: "content-box",
      mozBoxSizing: "content-box",
      webkitBoxSizing: "content-box",
    })

    if (!inFlow) {
      // Copy size if positioned absolutely, to work for bottom/right positioned elements.
      DomUtils.extend(spacerCSS, <CSSProperty>DomUtils.css(this.pin, ["width", "height"]))
    }

    DomUtils.css(spacer, spacerCSS)
    spacer?.setAttribute(Scene.PIN_SPACER_ATTRIBUTE, "")
    DomUtils.addClass(spacer, ["scrollmagic-pin-spacer"])

    // Set the pin Options
    if (spacer) {
      this.pinOptions = {
        spacer: spacer,
        inFlow: inFlow,
        pushFollowers: pushFollowers,
        relSize: {
          // Save if size is defined using % values. if so, handle spacer resize differently...
          width: sizeCSS["width"].slice(-1) === "%",
          height: sizeCSS["height"].slice(-1) === "%",
          autoFullWidth:
            sizeCSS["width"] === "auto" && inFlow && DomUtils.isMarginCollapseType(<string>pinCSS["display"]),
        },
      }
    }

    // if (!this.pin.___origStyle) {
    //   this.pin.___origStyle = {}
    //   const pinInlineCSS = this._pin.style
    //   const copyStyles = boundsParams.concat([
    //     "width",
    //     "height",
    //     "position",
    //     "boxSizing",
    //     "mozBoxSizing",
    //     "webkitBoxSizing",
    //   ])
    //   copyStyles.forEach((val) => {
    //     this.pin.___origStyle[val] = pinInlineCSS[val] || ""
    //   })
    // }

    // If relative size, transfer it to spacer and make pin calculate it...
    if (this.pinOptions?.relSize.width) {
      DomUtils.css(spacer, { width: sizeCSS["width"] })
    }
    if (this.pinOptions?.relSize.height) {
      DomUtils.css(spacer, { height: sizeCSS["height"] })
    }

    // Now place the pin element inside the spacer
    spacer?.appendChild(this.pin)

    // And set new css
    DomUtils.css(this.pin, {
      position: inFlow ? "relative" : "absolute",
      margin: "auto",
      top: "auto",
      left: "auto",
      bottom: "auto",
      right: "auto",
    })

    if (this.pinOptions?.relSize.width || this.pinOptions?.relSize.autoFullWidth) {
      DomUtils.css(this.pin, {
        boxSizing: "border-box",
        mozBoxSizing: "border-box",
        webkitBoxSizing: "border-box",
      })
    }

    // Add listener to document to update pin position in case controller is not the document.
    window.addEventListener("scroll", this.updatePinInContainer.bind(this))
    window.addEventListener("resize", this.updatePinInContainer.bind(this))
    window.addEventListener("resize", this.updateRelativePinSpacer.bind(this))

    // Add mousewheel listener to catch scrolls over fixed elements
    this.pin.addEventListener("mousewheel", this.onMousewheelOverPin.bind(this))
    this.pin.addEventListener("DOMMouseScroll", this.onMousewheelOverPin.bind(this))

    this.log(3, "Added pin")

    // Finally update the pin to init
    this.updatePinState()

    return this
  }

  /**
   * Remove the pin from the scene.
   *
   * @example
   * // Remove the pin from the scene without resetting it (the spacer is not removed)
   * scene.removePin()
   *
   * // Remove the pin from the scene and reset the pin element to its initial position (spacer is removed)
   * scene.removePin(true)
   *
   * @param {boolean} [reset=false] - If `false` the spacer will not be removed and the element's position will not be reset.
   *
   * @returns {Scene} Parent object for chaining.
   */
  public removePin(reset?: boolean): Scene {
    if (this.pin) {
      if (this.state === State.During) {
        this.updatePinState(true) // Force unpin at position
      }
      if (reset || !this.controller) {
        // If there's no controller no progress was made anyway...
        const pinTarget = this.pinOptions?.spacer.firstChild // Usually the pin element, but may be another spacer (cascaded pins)...

        if ((<HTMLElement>pinTarget)?.hasAttribute(Scene.PIN_SPACER_ATTRIBUTE)) {
          // Copy margins to child spacer
          const style = this.pinOptions?.spacer.style
          if (style) {
            const values = ["margin", "marginLeft", "marginRight", "marginTop", "marginBottom"]
            const margins: CSSProperty = {}
            values.forEach(function (val) {
              margins[val] = style[val] || ""
            })
            DomUtils.css(<HTMLElement>pinTarget, margins)
          }
        }

        if (pinTarget) {
          this.pinOptions?.spacer.parentNode?.insertBefore(pinTarget, this.pinOptions.spacer)
        }

        this.pinOptions?.spacer.parentNode?.removeChild(this.pinOptions.spacer)

        // FIXME: ___origStyle doesn't exist anywhere
        // if (!(<HTMLElement>this.pin.parentNode)?.hasAttribute(Scene.PIN_SPACER_ATTRIBUTE)) {
        //   // If it's the last pin for this element -> restore inline styles
        //   // TODO: only correctly set for first pin (when cascading) - how to fix?
        //   DomUtils.css(this.pin, this.pin?.___origStyle)
        //   delete this.pin?.___origStyle
        // }
      }

      window.removeEventListener("scroll", this.updatePinInContainer.bind(this))
      window.removeEventListener("resize", this.updatePinInContainer.bind(this))
      window.removeEventListener("resize", this.updateRelativePinSpacer.bind(this))

      this.pin.removeEventListener("mousewheel", this.onMousewheelOverPin.bind(this))
      this.pin.removeEventListener("DOMMouseScroll", this.onMousewheelOverPin.bind(this))

      this.pin = undefined

      this.log(3, "removed pin (reset: " + (reset ? "true" : "false") + ")")
    }

    return this
  }

  /**
   * Add a tween to the scene.
   *
   * If you want to add multiple tweens, add them into a GSAP Timeline object and supply it instead (see example below).
   *
   * If the scene has a duration, the tween's duration will be projected to the scroll distance of the scene, meaning its progress will be synced to scrollbar movement.
   * For a scene with a duration of `0`, the tween will be triggered when scrolling forward past the scene's trigger position and reversed, when scrolling back.
   * To gain better understanding, check out the [Simple Tweening example](../examples/basic/simple_tweening.html).
   *
   * Instead of supplying a tween this method can also be used as a shorthand for `TweenMax.to()` (see example below).
   *
   * @example
   * // Add a single tween via variable
   * let tween = TweenMax.to("obj"), 1, {x: 100}
   * scene.setTween(tween)
   *
   * // Add multiple tweens, wrapped in a timeline.
   * let timeline = new TimelineMax()
   * let tween1 = TweenMax.from("obj1", 1, {x: 100})
   * let tween2 = TweenMax.to("obj2", 1, {y: 100})
   * timeline
   *   .add(tween1)
   *   .add(tween2);
   * scene.addTween(timeline)
   *
   * // Short hand to add a TweenMax.to() tween
   * scene.setTween("obj3", 0.5, {y: 100})
   *
   * // Short hand to add a TweenMax.to() tween for 1 second
   * // This is useful, when the scene has a duration and the tween duration isn't important anyway
   * scene.setTween("obj3", {y: 100})
   *
   * @param {(TweenObject)} TweenObject - A TweenMax, TweenLite, TimelineMax or TimelineLite object that should be animated in the scene.
   * @param {(number)} duration - A duration for the tween, or tween parameters. If an object containing parameters are supplied, a default duration of 1 will be used.
   * @param {object} params - The parameters for the tween
   * @returns {Scene} Parent object for chaining.
   */
  public setTween(tween: TweenMax | TimelineMax, easing?: boolean): Scene {
    this.easing = !!easing

    let newTween: TimelineMax

    try {
      // Wrap Tween into a Timeline Object if not gsap 3 or greater and available to include delay and repeats in the duration and standardize methods.
      if (tween instanceof TweenMax) {
        newTween = new TimelineMax({ smoothChildTiming: true }).add(tween)
      } else {
        newTween = tween
      }
      newTween.pause()
    } catch (e) {
      this.log(1, "ERROR calling method 'setTween()': Supplied argument is not a valid TweenObject")
      return this
    }

    if (this.tween) {
      // Kill old tween?
      this.removeTween()
    }

    this.tween = newTween

    // Some properties need to be transferred it to the wrapper, otherwise they would get lost.
    if (tween.repeat && tween.repeat() === -1) {
      // TweenMax or TimelineMax Object?
      this.tween.repeat(-1)
      this.tween.yoyo(tween.yoyo())
    }

    // Some tween validations and debugging helpers
    if (this.tweenChanges && !this.tween.tweenTo) {
      this.log(2, "WARNING: tweenChanges will only work if the TimelineMax object is available for ScrollMagic.")
    }

    // Check if there are position tweens defined for the trigger and warn about it :)
    // if (this.tween && this.controller && this.triggerElement && this.logLevel >= 2) {
    //   // Controller is needed to know scroll direction.
    //   const triggerTweens = gsap.getTweensOf(this.triggerElement)
    //   const isVertical = this.controller.info().isVertical

    //   triggerTweens.forEach((value?: gsap.core.Tween) => {
    //     const tweenvars = value?.vars.css || value?.vars
    //     const condition = isVertical
    //       ? tweenvars.top !== undefined || tweenvars.bottom !== undefined
    //       : tweenvars.left !== undefined || tweenvars.right !== undefined

    //     if (condition) {
    //       this.log(
    //         2,
    //         "WARNING: Tweening the position of the trigger element affects the scene timing and should be avoided!",
    //       )
    //       return false
    //     }
    //   })
    // }

    // Warn about tween overwrites, when an element is tweened multiple times
    // if (parseFloat(TweenLite.version) >= 1.14) {
    //   // onOverwrite only present since GSAP v1.14.0
    //   // However, onInterrupt deprecated onOverwrite in GSAP v3
    //   const methodUsed = GSAP3_OR_GREATER ? "onInterrupt" : "onOverwrite"
    //   const list = this._tween.getChildren ? this._tween.getChildren(true, true, false) : [this._tween] // get all nested tween objects

    //   const newCallback = () => {
    //     this.log(
    //       2,
    //       "WARNING: tween was overwritten by another. To learn how to avoid this issue see here: https://github.com/janpaepke/ScrollMagic/wiki/WARNING:-tween-was-overwritten-by-another",
    //     )
    //   }

    //   for (let i = 0, thisTween, oldCallback; i < list.length; i++) {
    //     thisTween = list[i]

    //     if (oldCallback !== newCallback) {
    //       // if tweens is added more than once
    //       oldCallback = thisTween.vars[methodUsed]

    //       thisTween.vars[methodUsed] = function () {
    //         if (oldCallback) {
    //           oldCallback.apply(this, arguments)
    //         }
    //         newCallback.apply(this, arguments)
    //       }
    //     }
    //   }
    // }

    this.log(3, "Added tween")

    this.updateTweenProgress()

    return this
  }

  /**
   * Remove the tween from the scene.
   *
   * This will terminate the control of the Scene over the tween.
   *
   * Using the reset option you can decide if the tween should remain in the current state or be rewound to set the target elements back to the state they were in before the tween was added to the scene.
   *
   * @example
   * // Remove the tween from the scene without resetting it
   * scene.removeTween()
   *
   * // Remove the tween from the scene and reset it to initial position
   * scene.removeTween(true)
   *
   * @param {boolean} [reset=false] - If `true` the tween will be reset to its initial values.
   *
   * @returns {Scene} Parent object for chaining.
   */
  public removeTween(reset?: boolean): Scene {
    if (this.tween) {
      if (reset) {
        this.tween.progress(0).pause()
      }
      this.tween.kill()
      this.tween = undefined
      this.log(3, "Removed tween (reset: " + (reset ? "true" : "false") + ")")
    }
    return this
  }

  /**
   * Add visual indicators for a ScrollMagic.Scene.
   *
   * @example
   * // Add basic indicators
   * scene.addIndicators()
   *
   * // Passing options
   * scene.addIndicators({name: "pin scene", colorEnd: "#FFFFFF"})
   *
   * @param {IndicatorOptions} [options] - An object containing one or more options for the indicators.
   * @param {(string|HTMLElement)} [options.parent] - A selector or a DOM Object that the indicators should be added to. If undefined, the controller's container will be used.
   *
   * @returns {Scene} Parent object for chaining.
   */
  public addIndicators(options?: IndicatorOptions): Scene {
    if (!this.indicator) {
      this.autoIndex++
      this.indicator = new Indicator(this, options, this.autoIndex)

      this.on("add.plugin_addIndicators", this.indicator.add.bind(this.indicator))
      this.on("remove.plugin_addIndicators", this.indicator.remove.bind(this.indicator))
      this.on("destroy.plugin_addIndicators", this.removeIndicators.bind(this))

      // It the scene already has a controller we can start right away.
      if (this.controller) {
        this.indicator.add()
      }
    }

    return this
  }

  /**
   * Removes visual indicators from a ScrollMagic.Scene.
   *
   * @example
   * // Remove previously added indicators
   * scene.removeIndicators()
   *
   * @returns {Scene} Parent object for chaining.
   */
  public removeIndicators(): Scene {
    if (this.indicator) {
      this.indicator.remove()
      this.off("*.plugin_addIndicators")
      this.indicator = undefined
    }
    return this
  }

  /**
   * Updates the duration if set to a dynamic function.
   *
   * This method is called when the scene is added to a controller and in regular intervals from the controller through scene.refresh().
   *
   * @fires {@link Scene.change}, if the duration changed
   * @fires {@link Scene.shift}, if the duration changed
   *
   * @param {boolean} [suppressEvents=false] - If true the shift event will be suppressed.
   */
  private updateDuration(suppressEvents?: boolean): void {
    // Update duration
    if (this.durationUpdateMethod) {
      const newDuration = this.validateDuration(this.durationUpdateMethod())

      const changed = newDuration !== this._duration

      this._duration = newDuration

      if (changed && !suppressEvents) {
        // Set
        this.trigger("change", { what: "duration", newValue: this._duration })
        this.trigger("shift", { reason: "duration" })
      }
    }
  }

  /**
   * Updates the position of the triggerElement, if present.
   *
   * This method is called ...
   *  - ... when the triggerElement is changed
   *  - ... when the scene is added to a (new) controller
   *  - ... in regular intervals from the controller through scene.refresh().
   *
   * @fires {@link Scene.shift}, if the position changed
   *
   * @param {boolean} [suppressEvents=false] - If true the shift event will be suppressed.
   */
  private updateTriggerElementPosition(suppressEvents?: boolean): void {
    let elementPos = 0
    let triggerElement = this._triggerElement

    // Either an element exists or was removed and the _triggerPosition is still > 0
    if (this.controller && (triggerElement || this._triggerPosition > 0)) {
      // There currently a triggerElement set
      if (triggerElement) {
        // Check if element is still attached to DOM
        if (triggerElement?.parentNode) {
          const controllerInfo: ControllerInfo = this.controller.info()
          const containerOffset = DomUtils.getOffset(controllerInfo.container) // Container position is needed because element offset is returned in relation to document, not in relation to container.
          const param = controllerInfo.isVertical ? OffsetParam.Top : OffsetParam.Left // Which param is of interest?

          // If parent is spacer, use spacer position instead so correct start position is returned for pinned elements.
          while ((<HTMLElement>triggerElement.parentNode).hasAttribute(Scene.PIN_SPACER_ATTRIBUTE)) {
            triggerElement = <HTMLElement>triggerElement.parentNode
          }

          const elementOffset = DomUtils.getOffset(triggerElement)

          // Container is not the document root, so substract scroll Position to get correct trigger element position relative to scrollcontent
          if (!controllerInfo.isDocument) {
            containerOffset[param] -= this.controller.scrollPos()
          }

          elementPos = elementOffset[param] - containerOffset[param]
        } else {
          // There was an element, but it was removed from DOM
          this.log(2, "WARNING: triggerElement was removed from DOM and will be reset to", undefined)
          this.triggerElement = undefined // Unset, so a change event is triggered
        }
      }

      const changed = elementPos != this._triggerPosition

      this._triggerPosition = elementPos

      if (changed && !suppressEvents) {
        this.trigger("shift", { reason: "triggerElementPosition" })
      }
    }
  }

  /**
   * Update the start and end scrollOffset of the container.
   *
   * The positions reflect what the controller's scroll position will be at the start and end respectively.
   *
   * Is called, when:
   *   - Scene event "change" is called with: offset, triggerHook, duration
   *   - Scroll container event "resize" is called
   *   - The position of the triggerElement changes
   *   - The controller changes -> addTo()
   */
  private updateScrollOffset(): void {
    this._scrollOffset = { start: this._triggerPosition + this._offset, end: 0 }

    // Take away triggerHook portion to get relative to top
    if (this.controller && this._triggerElement) {
      this._scrollOffset.start -= this.controller.info().size * this._triggerHook
    }

    this._scrollOffset.end = this._scrollOffset.start + this._duration
  }

  /**
   * Update the pin state.
   */
  private updatePinState(forceUnpin?: boolean): void {
    if (this.pin && this.pinOptions && this.controller) {
      const containerInfo = this.controller.info()
      const pinTarget = <HTMLElement>this.pinOptions.spacer.firstChild // May be pin element or another spacer, if cascading pins

      // During scene or if duration is 0 and we are past the trigger
      if (!forceUnpin && this.state === State.During) {
        // Pinned state
        if (DomUtils.css(pinTarget, "position") != "fixed") {
          // Change state before updating pin spacer (position changes due to fixed collapsing might occur.)
          DomUtils.css(pinTarget, { position: "fixed" })
          // Update pin spacer
          this.updatePinDimensions()
        }

        const fixedPos = DomUtils.getOffset(this.pinOptions.spacer, true) // Get viewport position of spacer
        const scrollDistance =
          this._reverse || this._duration === 0
            ? containerInfo.scrollPos - this._scrollOffset.start // Quicker
            : Math.round(this._progress * this._duration * 10) / 10 // If no reverse and during pin the position needs to be recalculated using the progress

        // Add scrollDistance
        fixedPos[containerInfo.isVertical ? "top" : "left"] += scrollDistance

        // Set new values
        if (this.pinOptions.spacer.firstChild) {
          DomUtils.css(<HTMLElement>this.pinOptions.spacer.firstChild, {
            top: fixedPos.top,
            left: fixedPos.left,
          })
        }
      } else {
        // Unpinned state
        const newCSS: CSSProperty = {
          position: this.pinOptions.inFlow ? "relative" : "absolute",
          top: 0,
          left: 0,
        }

        let change = DomUtils.css(pinTarget, "position") != newCSS.position

        if (!this.pinOptions.pushFollowers) {
          newCSS[containerInfo.isVertical ? "top" : "left"] = this._duration * this._progress
        } else if (this._duration > 0) {
          // Only concerns scenes with duration
          if (
            this.state === State.After &&
            parseFloat(<string>DomUtils.css(this.pinOptions.spacer, "padding-top")) === 0
          ) {
            change = true // If in after state but havent updated spacer yet (jumped past pin)
          } else if (
            this.state === State.Before &&
            parseFloat(<string>DomUtils.css(this.pinOptions.spacer, "padding-bottom")) === 0
          ) {
            // Before
            change = true // Jumped past fixed state upward direction
          }
        }

        // Set new values
        DomUtils.css(pinTarget, newCSS)

        if (change) {
          // Update pin spacer if state changed
          this.updatePinDimensions()
        }
      }
    }
  }

  /**
   * Updates the Pin state (in certain scenarios)
   *
   * If the controller container is not the document and we are mid-pin-phase scrolling or resizing the main document can result to wrong pin positions.
   *
   * So this function is called on resize and scroll of the document.
   */
  private updatePinInContainer(): void {
    if (this.controller && this.pin && this.state === State.During && !this.controller.info().isDocument) {
      this.updatePinState()
    }
  }

  /**
   * Updates the Pin spacer size state (in certain scenarios)
   *
   * If container is resized during pin and relatively sized the size of the pin might need to be updated...
   *
   * So this function is called on resize of the container.
   */
  private updateRelativePinSpacer(): void {
    if (
      this.controller &&
      this.pin && // Well, duh
      this.pinOptions &&
      this.state === State.During && // element in pinned state? // is width or height relatively sized, but not in relation to body? then we need to recalc.
      (((this.pinOptions.relSize.width || this.pinOptions.relSize.autoFullWidth) &&
        this.pinOptions.spacer.parentNode &&
        DomUtils.getWidth(window) != DomUtils.getWidth(<HTMLElement>this.pinOptions.spacer.parentNode)) ||
        (this.pinOptions.relSize.height &&
          this.pinOptions.spacer.parentNode &&
          DomUtils.getHeight(window) != DomUtils.getHeight(<HTMLElement>this.pinOptions.spacer.parentNode)))
    ) {
      this.updatePinDimensions()
    }
  }

  /**
   * Update the pin spacer and/or element size.
   *
   * The size of the spacer needs to be updated whenever the duration of the scene changes, if it is to push down following elements.
   */
  private updatePinDimensions(): void {
    // No spacerresize, if original position is absolute
    if (this.pin && this.controller && this.pinOptions?.inFlow) {
      const during: boolean = this.state === State.During
      const isVertical = this.controller.info().isVertical
      const pinTarget = this.pinOptions?.spacer.firstChild // Usually the pined element but can also be another spacer (cascaded pins)
      const marginCollapse = DomUtils.isMarginCollapseType(<string>DomUtils.css(this.pinOptions?.spacer, "display"))
      const css: CSSProperty = {}

      // Set new size
      // If relsize: spacer -> pin | else: pin -> spacer
      if (this.pinOptions?.relSize.width || this.pinOptions?.relSize.autoFullWidth) {
        if (during) {
          DomUtils.css(this.pin, { width: DomUtils.getWidth(this.pinOptions?.spacer) })
        } else {
          DomUtils.css(this.pin, { width: "100%" })
        }
      } else {
        // minwidth is needed for cascaded pins.
        css["min-width"] = DomUtils.getWidth(isVertical ? this.pin : <HTMLElement>pinTarget, true, true)
        css["width"] = during ? css["min-width"] : "auto"
      }

      if (this.pinOptions?.relSize.height) {
        if (during) {
          // The only padding the spacer should ever include is the duration (if pushFollowers = true), so we need to substract that.
          if (this.pinOptions) {
            DomUtils.css(this.pin, {
              height:
                DomUtils.getHeight(this.pinOptions?.spacer) - (this.pinOptions?.pushFollowers ? this._duration : 0),
            })
          }
        } else {
          DomUtils.css(this.pin, { height: "100%" })
        }
      } else {
        // Margin is only included if it's a cascaded pin to resolve an IE9 bug
        css["min-height"] = DomUtils.getHeight(isVertical ? <HTMLElement>pinTarget : this.pin, true, !marginCollapse) // Needed for cascading pins
        css["height"] = during ? css["min-height"] : "auto"
      }

      // Add space for duration if pushFollowers is true
      if (this.pinOptions?.pushFollowers) {
        css["padding" + (isVertical ? "Top" : "Left")] = this._duration * this._progress
        css["padding" + (isVertical ? "Bottom" : "Right")] = this._duration * (1 - this._progress)
      }

      DomUtils.css(this.pinOptions?.spacer, css)
    }
  }

  /**
   * Is called, when the mousewhel is used while over a pinned element inside a div container.
   *
   * If the scene is in fixed state scroll events would be counted towards the body. This forwards the event to the scroll container.
   */
  private onMousewheelOverPin(e: Event): void {
    if (this.controller && this.pin && this.state === State.During && !this.controller.info().isDocument) {
      // Un pin state
      e.preventDefault()

      this.controller.setScrollPos(
        this.controller.info().scrollPos -
          ((e["wheelDelta"] || e[this.controller.info().isVertical ? "wheelDeltaY" : "wheelDeltaX"]) / 3 ||
            -e["detail"] * 30),
      )
    }
  }

  private setOptions(options: SceneOptions): void {
    const newOptions = {
      duration: <string | number | (() => number)>0,
      offset: 0,
      triggerElement: <string | HTMLElement | undefined>undefined,
      triggerHook: <string | number>0.5,
      reverse: true,
      logLevel: 2,
      tweenChanges: false,
    }

    if (options.duration !== undefined) {
      newOptions.duration = options.duration
    }
    this._duration = this.validateDuration(newOptions.duration)

    if (options.offset !== undefined) {
      newOptions.offset = options.offset
    }
    this._offset = this.validateOffset(newOptions.offset)

    if (options.triggerElement !== undefined) {
      newOptions.triggerElement = options.triggerElement
    }
    this._triggerElement =
      newOptions.triggerElement !== undefined
        ? this.validateTriggerElement(newOptions.triggerElement)
        : newOptions.triggerElement

    if (options.triggerHook !== undefined) {
      newOptions.triggerHook = options.triggerHook
    }
    this._triggerHook = this.validateTriggerHook(newOptions.triggerHook)

    if (options.reverse !== undefined) {
      newOptions.reverse = options.reverse
    }
    this._reverse = this.validateReverse(newOptions.reverse)

    if (options.logLevel !== undefined) {
      newOptions.logLevel = options.logLevel
    }
    this._logLevel = this.valdiateLogLevel(newOptions.logLevel)

    if (options.tweenChanges !== undefined) {
      newOptions.tweenChanges = options.tweenChanges
    }
    this._tweenChanges = this.validateTweenChanges(newOptions.tweenChanges)
  }

  /**
   * Trigger an event.
   *
   * @example
   * this.trigger("change")
   *
   * @param {string} name - The name of the event that should be triggered.
   * @param {SceneEventVars} [vars] - An object containing info that should be passed to the callback.
   *
   * @returns {Scene} Parent object for chaining.
   */
  private trigger(name: string, vars?: SceneEventVars): Scene {
    const parts = name.trim().split(".")

    const eventName = parts[0]
    const namespace = parts[1]

    const listeners: SceneListener[] = this.listeners ? this.listeners[eventName] || [] : []

    this.log(3, "Event fired:", eventName, vars ? "->" : "", vars || "")

    if (listeners.length) {
      listeners.forEach((listener: SceneListener) => {
        if (!namespace || namespace === listener.namespace) {
          listener.callback.call(this, new SceneEvent(eventName, listener.namespace, this, vars))
        }
      })
    }

    return this
  }

  /**
   * Define a css class modification while the scene is active.
   *
   * When the scene triggers the classes will be added to the supplied element and removed, when the scene is over.
   *
   * If the scene duration is 0 the classes will only be removed if the user scrolls back past the start position.
   *
   * @example
   * // Add the class 'myclass' to the element with the id 'my-elem' for the duration of the scene
   * scene.setClassToggle("#my-elem", "myclass")
   *
   * // Add multiple classes to multiple elements defined by the selector '.classChange'
   * scene.setClassToggle(".classChange", "class1 class2 class3")
   *
   * @param {(string|HTMLElement)} element - A Selector targeting one or more elements or a DOM object that is supposed to be modified.
   * @param {string} classes - One or more Classnames (separated by space) that should be added to the element during the scene.
   *
   * @returns {Scene} Parent object for chaining.
   */
  setClassToggle(element: string | HTMLElement, classes: string): Scene {
    const elems = DomUtils.getElements(element)

    if (elems.length === 0 || !Type.isString(classes)) {
      this.log(
        1,
        "ERROR calling method 'setClassToggle()': Invalid " +
          (elems.length === 0 ? "element" : "classes") +
          " supplied.",
      )
      return this
    }

    if (this.cssClassElems.length > 0) {
      // Remove old ones
      this.removeClassToggle()
    }

    this.cssClasses = classes.trim().split(" ")
    this.cssClassElems = <HTMLElement[]>elems

    this.on("enter.internal_class leave.internal_class", (e) => {
      const toggle = e?.type === "enter" ? DomUtils.addClass : DomUtils.removeClass
      this.cssClassElems.forEach((elem) => {
        toggle(elem, this.cssClasses)
      })
    })

    return this
  }

  /**
   * Remove the class binding from the scene.
   *
   * @example
   * // Remove class binding from the scene without reset
   * scene.removeClassToggle()
   *
   * // Remove class binding and remove the changes it caused
   * scene.removeClassToggle(true)
   *
   * @param {boolean} [reset=false] - If `false` and the classes are currently active, they will remain on the element. If `true` they will be removed.
   * @returns {Scene} Parent object for chaining.
   */
  removeClassToggle(reset?: boolean): Scene {
    if (reset) {
      this.cssClassElems.forEach((elem) => {
        DomUtils.removeClass(elem, this.cssClasses)
      })
    }

    this.off("start.internal_class end.internal_class")

    this.cssClasses = undefined
    this.cssClassElems = []

    return this
  }

  /**
   * Update the tween progress to current position.
   */
  private updateTweenProgress(): void {
    if (this.tween) {
      const progress = this.progress
      const state = this.state

      if (this.tween.repeat && this.tween.repeat() === -1) {
        // Infinite loop, so not in relation to progress
        if (state === State.During && this.tween.paused()) {
          this.tween.play()
        } else if (state !== State.During && !this.tween.paused()) {
          this.tween.pause()
        }
      } else if (progress != this.tween.progress()) {
        // Do we even need to update the progress?
        // No infinite loop - so should we just play or go to a specific point in time?
        if (this.duration === 0) {
          // Play the animation
          if (progress > 0) {
            // Play from 0 to 1
            this.tween.play()
          } else {
            // Play from 1 to 0
            this.tween.reverse()
          }
        } else {
          // Go to a specific point in time
          if (this.tweenChanges && this.tween.tweenTo) {
            // Go smooth
            this.tween.tweenTo(progress * this.tween.duration())
          } else if (this.easing) {
            // Apply ease for every tween progress, making the animaton smooth
            const tweens = this.tween.getChildren()
            tweens.forEach((tween) => {
              if (tween.vars.data?.ease && tween.vars.data?.momentum) {
                gsap.to(tween, tween.vars.data.momentum, { progress: progress, ease: tween.vars.data.ease })
              } else {
                tween.totalProgress(progress).pause()
              }
            })
          } else {
            // Just hard set it
            this.tween.totalProgress(progress).pause() // Use totalProgress because it considers repeat property
          }
        }
      }
    }
  }

  /**
   * Trigger a shift event, when the container is resized and the triggerHook is > 1.
   */
  private onContainerResize(): void {
    if (this._triggerHook > 0) {
      this.trigger("shift", { reason: "containerResize" })
    }
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
   * Valdiators
   */

  public validateDuration(value: string | number | (() => number)): number {
    // String
    if (Type.isString(value)) {
      const str = <string>value
      if (str.match(/^(\.|\d)*\d+%$/)) {
        // Percentage value
        const perc = parseFloat(str) / 100

        value = () => {
          return this._controller ? this._controller.info().size * perc : 0
        }
      }
    }

    // Function
    if (Type.isFunction(value)) {
      this.durationUpdateMethod = <() => number>value
      try {
        value = this.durationUpdateMethod()
      } catch (e) {
        value = -1 // Will cause error below
      }
    }

    // Value has to be float
    if (Type.isString(value)) {
      value = parseFloat(<string>value)
    }
    if (!Type.isNumber(value) || value < 0) {
      if (this.durationUpdateMethod) {
        this.durationUpdateMethod = undefined
        throw ['Invalid return value of supplied function for option "duration": ', value]
      } else {
        throw ['Invalid value for option "duration":', value]
      }
    }

    return <number>value
  }

  public validateOffset(value: string | number): number {
    if (Type.isString(value)) {
      value = parseFloat(<string>value)
    }
    return <number>value
  }

  public validateTriggerElement(value: string | HTMLElement): HTMLElement {
    const elem = <HTMLElement>DomUtils.getElements(value)[0]
    if (elem && elem.parentNode) {
      return elem
    } else {
      throw ['Element defined in option "triggerElement" was not found: ', value]
    }
  }

  public validateTriggerHook(value: string | number): number {
    const translate = {
      onCenter: 0.5,
      onEnter: 1,
      onLeave: 0,
    }
    if (Type.isNumber(value)) {
      return Math.max(0, Math.min(<number>value, 1)) // Make sure its betweeen 0 and 1
    } else if (Type.isString(value) && <string>value in translate) {
      return translate[value]
    }
    throw ['Invalid value for option "triggerHook": ', value]
  }

  public validateReverse(value?: boolean): boolean {
    return !!value // Force boolean
  }

  private validateTweenChanges(value?: boolean): boolean {
    return !!value // Force boolean
  }

  private valdiateLogLevel(value: number): number {
    if (value < 0 || value > 3) {
      throw ['Invalid value for option "logLevel": ', value]
    }
    return value
  }

  // Need to trigger the "change" event, so that updateScrollOffset gets called
  public setValue(attribute: string, value: any): void {
    switch (attribute) {
      case "duration":
        this.duration = this.validateDuration(<string | number | (() => number)>value)
        break
      case "offset":
        this.offset = this.validateOffset(<string | number>value)
        break
      case "triggerElement":
        this.triggerElement = this.validateTriggerElement(<string | HTMLElement>value)
        break
      case "triggerHook":
        this.triggerHook = this.validateTriggerHook(<string | number>value)
        break
      case "reverse":
        this.reverse = this.validateReverse(<boolean | undefined>value)
        break
      case "tweenChanges":
        this.tweenChanges = this.validateTweenChanges(<boolean | undefined>value)
        break
      case "logLevel":
        this.logLevel = this.valdiateLogLevel(<number>value)
        break
      default:
        throw Error(`No validator for attribute "${attribute}"`)
    }
  }
}
