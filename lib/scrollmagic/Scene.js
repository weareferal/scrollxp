import { SCENE_OPTIONS } from './defaults';
import { PIN_SPACER_ATTRIBUTE, FONT_SIZE, ZINDEX, EDGE_OFFSET, GSAP3_OR_GREATER } from './static';
import { _util } from './util';
import ScrollEvent from './ScrollEvent';
import Controller from './Controller';
import Indicator from './Indicator';
import { TimelineMax } from 'gsap';

const SCENE = {
  NAMESPACE: 'ScrollMagic.Scene',
  SCENE_STATE_BEFORE: 'BEFORE',
  SCENE_STATE_DURING: 'DURING',
  SCENE_STATE_AFTER: 'AFTER',
  DEFAULT_OPTIONS: SCENE_OPTIONS.defaults
};

class Scene {
  constructor(options) {
    this._options = _util.extend({}, SCENE.DEFAULT_OPTIONS, options);
    this._state = SCENE.SCENE_STATE_BEFORE;
    this._progress = 0;
    this._scrollOffset = {start: 0, end: 0}; // Reflects the controllers's scroll position for the start and end of the scene respectively
    this._triggerPos = 0;
    this._enabled = true;
    this._durationUpdateMethod;
    this._controller;
    this._listeners = {};

    for (let key in this._options) { // Check supplied options
      if (!SCENE.DEFAULT_OPTIONS.hasOwnProperty(key)) {
        this.log(2, "WARNING: Unknown option \"" + key + "\"");
        delete this._options[key];
      }
    }

    // Add getters/setters for all possible options
    for (let optionName in SCENE.DEFAULT_OPTIONS) {
      this.addSceneOption(optionName);
    }

    // Set event listeners
    this.on("change.internal", (e) => {
      if (e.what !== "loglevel" && e.what !== "tweenChanges") { // no need for a scene update scene with these options...
        if (e.what === "triggerElement") {
          this.updateTriggerElementPosition();
        } else if (e.what === "reverse") { // the only property left that may have an impact on the current scene state. Everything else is handled by the shift event.
          this.update();
        }
      }
    })
    .on("shift.internal", function (e) {
      this.updateScrollOffset();
      this.update(); // update scene to reflect new position
    });

    // TODO: Refactor it

    // Start - getters-setters.js

    let that = this;

    this._validate = _util.extend(SCENE_OPTIONS.validate, {
      // Validation for duration handled internally for reference to private var _durationMethod
      duration : function (val) {
        if (_util.type.String(val) && val.match(/^(\.|\d)*\d+%$/)) {
          // Percentage value
          let perc = parseFloat(val) / 100;
          val = function () {
            return that._controller ? that._controller.info("size") * perc : 0;
          };
        }
        if (_util.type.Function(val)) {
          // Function
          that._durationUpdateMethod = val;
          try {
            val = parseFloat(that._durationUpdateMethod());
          } catch (e) {
            val = -1; // will cause error below
          }
        }
        // val has to be float
        val = parseFloat(val);
        if (!_util.type.Number(val) || val < 0) {
          if (that._durationUpdateMethod) {
            that._durationUpdateMethod = undefined;
            throw ["Invalid return value of supplied function for option \"duration\":", val];
          } else {
            throw ["Invalid value for option \"duration\":", val];
          }
        }
        return val;
      }
    });

    // End - getters-setters.js

    // Start - Pinning feature

    this. _pin;
    this._pinOptions;

    this.on("shift.internal", (e) => {
        let durationChanged = e.reason === "duration";

        if ((this._state === SCENE.SCENE_STATE_AFTER && durationChanged) || (this._state === SCENE.SCENE_STATE_DURING && this._options.duration === 0)) {
          // If [duration changed after a scene (inside scene progress updates pin position)] or [duration is 0, we are in pin phase and some other value changed].
          this.updatePinState();
        }

        if (durationChanged) {
          this.updatePinDimensions();
        }
      })
      .on("progress.internal", (e) => {
        this.updatePinState();
      })
      .on("add.internal", (e) => {
        this.updatePinDimensions();
      })
      .on("destroy.internal", (e) => {
        this.removePin(e.reset);
      });

    // End - Pinning feature

    // Start - Class toggle feature

    this._cssClasses;
    this._cssClassElems = [];
    
    this.on("destroy.internal", (e) => {
      this.removeClassToggle(e.reset);
    });

    // End - Class toggle feature

    // Start - Animation GSAP plugin

    this._tween;

    // Set listeners
    this.on("progress.plugin_gsap", () => {
      this.updateTweenProgress();
    });

    this.on("destroy.plugin_gsap", (e) => {
      this.removeTween(e.reset);
    });

    // End - Animation GSAP plugin

    // Start - Debug plugin

    this._autoindex = 0;
    this.indicator;

    // End - Debug plugin

    // Validate all options
    this.validateOption();
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
   * The callback function will be fired at the respective event, and an object containing relevant data will be passed to the callback.
   * @method ScrollMagic.Scene#on
   *
   * @example
   * function callback (event) {
   * 		console.log("Event fired! (" + event.type + ")");
   * }
   * // add listeners
   * scene.on("change update progress start end enter leave", callback);
   *
   * @param {string} names - The name or names of the event the callback should be attached to.
   * @param {function} callback - A function that should be executed, when the event is dispatched. An event object will be passed to the callback.
   * @returns {Scene} Parent object for chaining.
   */
  on(names, callback) {
    if (_util.type.Function(callback)) {
      names = names.trim().split(' ');
      names.forEach((fullname) => {
        let nameparts = fullname.split('.');
        let eventname = nameparts[0];
        let namespace = nameparts[1];

        if (eventname != "*") { // Disallow wildcards
          if (!this._listeners[eventname]) {
            this._listeners[eventname] = [];
          }
          this._listeners[eventname].push({
            namespace: namespace || '',
            callback: callback
          });
        }
      });
    } else {
      this.log(1, "ERROR when calling '.on()': Supplied callback for '" + names + "' is not a valid function!");
    }
    return this;
  }

  /**
   * Remove one or more event listener.
   * @method ScrollMagic.Scene#off
   *
   * @example
   * function callback (event) {
   * 		console.log("Event fired! (" + event.type + ")");
   * }
   * // add listeners
   * scene.on("change update", callback);
   * // remove listeners
   * scene.off("change update", callback);
   *
   * @param {string} names - The name or names of the event that should be removed.
   * @param {function} [callback] - A specific callback function that should be removed. If none is passed all callbacks to the event listener will be removed.
   * @returns {Scene} Parent object for chaining.
  */
  off(names, callback) {
    if (!names) {
      this.log(1, "ERROR: Invalid event name supplied.");
      return this;
    }
    names = names.trim().split(' ');
    names.forEach((fullname, key) => {
      let nameparts = fullname.split('.');
      let eventname = nameparts[0];
      let namespace = nameparts[1] || '';
      let removeList = eventname === '*' ? Object.keys(this._listeners) : [eventname];

      removeList.forEach((remove) => {
        let list = this._listeners[remove] || [];
        let i = list.length;
        while(i--) {
          let listener = list[i];
          if (listener && (namespace === listener.namespace || namespace === '*') && (!callback || callback == listener.callback)) {
            list.splice(i, 1);
          }
        }
        if (!list.length) {
          delete this._listeners[remove];
        }
      });
    });
    return this;
  }

  /**
   * Trigger an event.
   * @method ScrollMagic.Scene#trigger
   *
   * @example
   * this.trigger("change");
   *
   * @param {string} name - The name of the event that should be triggered.
   * @param {object} [vars] - An object containing info that should be passed to the callback.
   * @returns {Scene} Parent object for chaining.
  */
  trigger(name, vars) {
    if (name) {
      let nameparts = name.trim().split('.');
      let eventname = nameparts[0];
      let namespace = nameparts[1];
      let listeners = this._listeners[eventname];

      this.log(3, 'event fired:', eventname, vars ? "->" : '', vars || '');

      let that = this;

      if (listeners) {
        listeners.forEach((listener, key) => {
          if (!namespace || namespace === listener.namespace) {
            listener.callback.call(that, new ScrollEvent(eventname, listener.namespace, that, vars));
          }
        });
      }
    } else {
      this.log(1, "ERROR: Invalid event name supplied.");
    }
    return this;
  }

  /**
   * Send a debug message to the console.
   * provided publicly with _log for plugins
   * @private
   *
   * @param {number} loglevel - The loglevel required to initiate output for the message.
   * @param {...mixed} output - One or more variables that should be passed to the console.
   */
  log(loglevel, output) {
    if (this._options.loglevel >= loglevel) {
      Array.prototype.splice.call(arguments, 1, 0, "(" + SCENE.NAMESPACE + ") ->");
      _util.log.apply(window, arguments);
    }
  }

  /**
   * Add the scene to a controller.  
   * This is the equivalent to `Controller.addScene(scene)`.
   * @method ScrollMagic.Scene#addTo
   *
   * @example
   * // add a scene to a ScrollMagic Controller
   * scene.addTo(controller);
   *
   * @param {ScrollMagic.Controller} controller - The controller to which the scene should be added.
   * @returns {Scene} Parent object for chaining.
   */
  addTo(controller) {
    if (!(controller instanceof Controller)) {
      this.log(1, "ERROR: supplied argument of 'addTo()' is not a valid ScrollMagic Controller");
    } else if (this._controller != controller) {
      // New controller
      if (this._controller) { // Was associated to a different controller before, so remove it...
        this._controller.removeScene(this);
      }
      this._controller = controller;
      this.validateOption();
      this.updateDuration(true);
      this.updateTriggerElementPosition(true);
      this.updateScrollOffset();
      this._controller.info("container").addEventListener('resize', this.onContainerResize.bind(this));
      this._controller.addScene(this);
      this.trigger("add", { controller: this._controller });
      this.log(3, "added " + SCENE.NAMESPACE + " to controller");
      this.update();
    }
    return this;
  }

  /**
   * **Get** or **Set** the current enabled state of the scene.  
   * This can be used to disable this scene without removing or destroying it.
   * @method ScrollMagic.Scene#enabled
   *
   * @example
   * // get the current value
   * var enabled = scene.enabled();
   *
     * // disable the scene
   * scene.enabled(false);
   *
   * @param {boolean} [newState] - The new enabled state of the scene `true` or `false`.
   * @returns {(boolean|Scene)} Current enabled state or parent object for chaining.
   */
  enabled(newState) {
    if (!arguments.length) { // get
      return this._enabled;
    } else if (this._enabled != newState) { // set
      this._enabled = !!newState;
      this.update(true);
    }
    return this;
  }

  /**
   * Remove the scene from the controller.  
   * This is the equivalent to `Controller.removeScene(scene)`.
   * The scene will not be updated anymore until you readd it to a controller.
   * To remove the pin or the tween you need to call removeTween() or removePin() respectively.
   * @method ScrollMagic.Scene#remove
   * @example
   * // remove the scene from its controller
   * scene.remove();
   *
   * @returns {Scene} Parent object for chaining.
   */
  remove() {
    if (this._controller) {
      this._controller.info("container").removeEventListener('resize', this.onContainerResize);

      let tmpParent = this._controller;

      this._controller = undefined;

      tmpParent.removeScene(this);

      this.trigger("remove");

      this.log(3, "removed " + SCENE.NAMESPACE + " from controller");
    }
    return this;
  }

  /**
   * Destroy the scene and everything.
   * @method ScrollMagic.Scene#destroy
   * @example
   * // destroy the scene without resetting the pin and tween to their initial positions
   * scene = scene.destroy();
   *
   * // destroy the scene and reset the pin and tween
   * scene = scene.destroy(true);
   *
   * @param {boolean} [reset=false] - If `true` the pin and tween (if existent) will be reset.
   * @returns {null} Null to unset handler variables.
   */
  destroy(reset) {
    this.trigger("destroy", { reset: reset });
    this.remove();
    this.off("*.*");
    this.log(3, "destroyed " + SCENE.NAMESPACE + " (reset: " + (reset ? "true" : "false") + ")");
    return null;
  }

  /**
   * Updates the Scene to reflect the current state.  
   * This is the equivalent to `Controller.updateScene(scene, immediately)`.  
   * The update method calculates the scene's start and end position (based on the trigger element, trigger hook, duration and offset) and checks it against the current scroll position of the container.  
   * It then updates the current scene state accordingly (or does nothing, if the state is already correct) – Pins will be set to their correct position and tweens will be updated to their correct progress.
   * This means an update doesn't necessarily result in a progress change. The `progress` event will be fired if the progress has indeed changed between this update and the last.  
   * _**NOTE:** This method gets called constantly whenever ScrollMagic detects a change. The only application for you is if you change something outside of the realm of ScrollMagic, like moving the trigger or changing tween parameters._
   * @method ScrollMagic.Scene#update
   * @example
   * // update the scene on next tick
   * scene.update();
   *
   * // update the scene immediately
   * scene.update(true);
   *
   * @fires Scene.update
   *
   * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next update cycle (better performance).
   * @returns {Scene} Parent object for chaining.
   */
  update(immediately) {
    if (this._controller) {
      if (immediately) {
        if (this._controller.enabled() && this._enabled) {
          let scrollPos = this._controller.info("scrollPos");
          let newProgress;

          if (this._options.duration > 0) {
            newProgress = (scrollPos - this._scrollOffset.start)/(this._scrollOffset.end - this._scrollOffset.start);
          } else {
            newProgress = scrollPos >= this._scrollOffset.start ? 1 : 0;
          }

          this.trigger("update", { startPos: this._scrollOffset.start, endPos: this._scrollOffset.end, scrollPos: scrollPos});

          this.progress(newProgress);
        } else if (_pin && _state === SCENE.SCENE_STATE_DURING) {
          this.updatePinState(true); // unpin in position
        }
      } else {
        this._controller.updateScene(this, false);
      }
    }
    return this;
  }

  /**
   * Updates dynamic scene variables like the trigger element position or the duration.
   * This method is automatically called in regular intervals from the controller. See {@link ScrollMagic.Controller} option `refreshInterval`.
   * 
   * You can call it to minimize lag, for example when you intentionally change the position of the triggerElement.
   * If you don't it will simply be updated in the next refresh interval of the container, which is usually sufficient.
   *
   * @method ScrollMagic.Scene#refresh
   * @since 1.1.0
   * @example
   * scene = new ScrollMagic.Scene({triggerElement: "#trigger"});
   * 
   * // change the position of the trigger
   * $("#trigger").css("top", 500);
   * // immediately let the scene know of this change
   * scene.refresh();
   *
   * @fires {@link Scene.shift}, if the trigger element position or the duration changed
   * @fires {@link Scene.change}, if the duration changed
   *
   * @returns {Scene} Parent object for chaining.
   */
  refresh() {
    this.updateDuration();
    this.updateTriggerElementPosition();
    // Update trigger element position
    return this;
  }
  /**
   * **Get** or **Set** the scene's progress.  
   * Usually it shouldn't be necessary to use this as a setter, as it is set automatically by scene.update().  
   * The order in which the events are fired depends on the duration of the scene:
   *  1. Scenes with `duration == 0`:  
   *  Scenes that have no duration by definition have no ending. Thus the `end` event will never be fired.  
   *  When the trigger position of the scene is passed the events are always fired in this order:  
   *  `enter`, `start`, `progress` when scrolling forward  
   *  and  
   *  `progress`, `start`, `leave` when scrolling in reverse
   *  2. Scenes with `duration > 0`:  
   *  Scenes with a set duration have a defined start and end point.  
   *  When scrolling past the start position of the scene it will fire these events in this order:  
   *  `enter`, `start`, `progress`  
   *  When continuing to scroll and passing the end point it will fire these events:  
   *  `progress`, `end`, `leave`  
   *  When reversing through the end point these events are fired:  
   *  `enter`, `end`, `progress`  
   *  And when continuing to scroll past the start position in reverse it will fire:  
   *  `progress`, `start`, `leave`  
   *  In between start and end the `progress` event will be called constantly, whenever the progress changes.
   * 
   * In short:  
   * `enter` events will always trigger **before** the progress update and `leave` envents will trigger **after** the progress update.  
   * `start` and `end` will always trigger at their respective position.
   * 
   * Please review the event descriptions for details on the events and the event object that is passed to the callback.
   * 
   * @method ScrollMagic.Scene#progress
   * @example
   * // get the current scene progress
   * var progress = scene.progress();
   *
     * // set new scene progress
   * scene.progress(0.3);
   *
   * @fires {@link Scene.enter}, when used as setter
   * @fires {@link Scene.start}, when used as setter
   * @fires {@link Scene.progress}, when used as setter
   * @fires {@link Scene.end}, when used as setter
   * @fires {@link Scene.leave}, when used as setter
   *
   * @param {number} [progress] - The new progress value of the scene `[0-1]`.
   * @returns {number} `get` -  Current scene progress.
   * @returns {Scene} `set` -  Parent object for chaining.
   */
  progress(progress) {
    if (!arguments.length) { // Get
      return this._progress;
    } else { // Set
      let doUpdate = false;
      let oldState = this._state;
      let scrollDirection = this._controller ? this._controller.info("scrollDirection") : 'PAUSED';
      let reverseOrForward = this._options.reverse || progress >= this._progress;

      if (this._options.duration === 0) {
        // Zero duration scenes
        doUpdate = this._progress != progress;
        this._progress = progress < 1 && reverseOrForward ? 0 : 1;
        this._state = this._progress === 0 ? SCENE.SCENE_STATE_BEFORE : SCENE.SCENE_STATE_DURING;
      } else {
        // Scenes with start and end
        if (progress < 0 && this._state !== SCENE.SCENE_STATE_BEFORE && reverseOrForward) {
          // Go back to initial state
          this._progress = 0;
          this._state = SCENE.SCENE_STATE_BEFORE;
          doUpdate = true;
        } else if (progress >= 0 && progress < 1 && reverseOrForward) {
          this._progress = progress;
          this._state = SCENE.SCENE_STATE_DURING;
          doUpdate = true;
        } else if (progress >= 1 && this._state !== SCENE.SCENE_STATE_AFTER) {
          this._progress = 1;
          this._state = SCENE.SCENE_STATE_AFTER;
          doUpdate = true;
        } else if (this._state === SCENE.SCENE_STATE_DURING && !reverseOrForward) {
          this.updatePinState(); // in case we scrolled backwards mid-scene and reverse is disabled => update the pin position, so it doesn't move back as well.
        }
      }
      if (doUpdate) {
        // Fire events
        let eventVars = { progress: this._progress, state: this._state, scrollDirection: scrollDirection };

        let stateChanged = this._state != oldState;

        const trigger = (eventName) => { // tmp helper to simplify code
          this.trigger(eventName, eventVars);
        };

        if (stateChanged) { // enter events
          if (oldState !== SCENE.SCENE_STATE_DURING) {
            trigger("enter");
            trigger(oldState === SCENE.SCENE_STATE_BEFORE ? "start" : "end");
          }
        }

        trigger("progress");

        if (stateChanged) { // leave events
          if (this._state !== SCENE.SCENE_STATE_DURING) {
            trigger(this._state === SCENE.SCENE_STATE_BEFORE ? "start" : "end");
            trigger("leave");
          }
        }
      }

      return this;
    }
  }

  /**
   * Update the start and end scrollOffset of the container.
   * The positions reflect what the controller's scroll position will be at the start and end respectively.
   * Is called, when:
   *   - Scene event "change" is called with: offset, triggerHook, duration 
   *   - scroll container event "resize" is called
   *   - the position of the triggerElement changes
   *   - the controller changes -> addTo()
   * @private
   */
  updateScrollOffset() {
    this._scrollOffset = { start: this._triggerPos + this._options.offset };

    if (this._controller && this._options.triggerElement) {
      // take away triggerHook portion to get relative to top
      this._scrollOffset.start -= this._controller.info("size") * this._options.triggerHook;
    }

    this._scrollOffset.end = this._scrollOffset.start + this._options.duration;
  }

  /**
   * Updates the duration if set to a dynamic function.
   * This method is called when the scene is added to a controller and in regular intervals from the controller through scene.refresh().
   * 
   * @fires {@link Scene.change}, if the duration changed
   * @fires {@link Scene.shift}, if the duration changed
   *
   * @param {boolean} [suppressEvents=false] - If true the shift event will be suppressed.
   * @private
   */
  updateDuration(suppressEvents) {
    // Update duration
    if (this._durationUpdateMethod) {
      let varname = "duration";
      if (this.changeOption(varname, this._durationUpdateMethod()) && !suppressEvents) { // Set
        this.trigger("change", { what: varname, newval: this._options[varname] });
        this.trigger("shift", { reason: varname });
      }
    }
  }

  /**
   * Updates the position of the triggerElement, if present.
   * This method is called ...
   *  - ... when the triggerElement is changed
   *  - ... when the scene is added to a (new) controller
   *  - ... in regular intervals from the controller through scene.refresh().
   * 
   * @fires {@link Scene.shift}, if the position changed
   *
   * @param {boolean} [suppressEvents=false] - If true the shift event will be suppressed.
   * @private
   */
  updateTriggerElementPosition(suppressEvents) {
    let elementPos = 0;
    let telem = this._options.triggerElement;

    if (this._controller && (telem || this._triggerPos > 0)) { // Either an element exists or was removed and the triggerPos is still > 0
      if (telem) { // There currently a triggerElement set
        if (telem.parentNode) { // Check if element is still attached to DOM
          let controllerInfo = this._controller.info();
          let containerOffset = _util.get.offset(controllerInfo.container); // Container position is needed because element offset is returned in relation to document, not in relation to container.
          let param = controllerInfo.vertical ? "top" : "left"; // Which param is of interest?
            
          // If parent is spacer, use spacer position instead so correct start position is returned for pinned elements.
          while (telem.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE)) {
            telem = telem.parentNode;
          }

          let elementOffset = _util.get.offset(telem);

          if (!controllerInfo.isDocument) { // Container is not the document root, so substract scroll Position to get correct trigger element position relative to scrollcontent
            containerOffset[param] -= this._controller.scrollPos();
          }

          elementPos = elementOffset[param] - containerOffset[param];

        } else { // There was an element, but it was removed from DOM
          this.log(2, "WARNING: triggerElement was removed from DOM and will be reset to", undefined);
          this.triggerElement(undefined); // Unset, so a change event is triggered
        }
      }

      let changed = elementPos != this._triggerPos;

      this._triggerPos = elementPos;

      if (changed && !suppressEvents) {
        this.trigger("shift", { reason: "triggerElementPosition" });
      }
    }
  }

  /**
   * Trigger a shift event, when the container is resized and the triggerHook is > 1.
   * @private
   */
  onContainerResize(e) {
    if (this._options.triggerHook > 0) {
      this.trigger("shift", { reason: "containerResize" });
    }
  }

  /**
   * Checks the validity of a specific or all options and reset to default if neccessary.
   * @private
   */
  validateOption(check) {
    check = arguments.length ? [check] : Object.keys(this._validate);
    check.forEach((optionName, key) => {
      let value;
      if (this._validate[optionName]) { // There is a validation method for this option
        try { // Validate value
          value = this._validate[optionName](this._options[optionName]);
        } catch (e) { // validation failed -> reset to default
          value = SCENE.DEFAULT_OPTIONS[optionName];
          // (BUILD) - REMOVE IN MINIFY - START
          var logMSG = _util.type.String(e) ? [e] : e;
          if (_util.type.Array(logMSG)) {
            logMSG[0] = "ERROR: " + logMSG[0];
            logMSG.unshift(1); // loglevel 1 for error msg
            this.log.apply(this, logMSG);
          } else {
            this.log(1, "ERROR: Problem executing validation callback for option '" + optionName + "':", e.message);
          }
          // (BUILD) - REMOVE IN MINIFY - END
        } finally {
          this._options[optionName] = value;
        }
      }
    });
  }

  /**
   * Helper used by the setter/getters for scene options
   * @private
   */
  changeOption(varname, newval) {
    let changed = false;
    let oldval = this._options[varname];
    if (this._options[varname] != newval) {
      this._options[varname] = newval;
      this.validateOption(varname); // resets to default if necessary
      changed = oldval != this._options[varname];
    }
    return changed;
  }

  // Generate getters/setters for all options
  addSceneOption(optionName) {
    if (!this[optionName]) {
      this[optionName] = function (newVal) {
        if (!arguments.length) { // get
          return this._options[optionName];
        } else {
          if (optionName === "duration") { // new duration is set, so any previously set function must be unset
            this._durationUpdateMethod = undefined;
          }
          if (this.changeOption(optionName, newVal)) { // set
            this.trigger("change", { what: optionName, newval: this._options[optionName] });
            if (SCENE_OPTIONS.shifts.indexOf(optionName) > -1) {
              this.trigger("shift", { reason: optionName });
            }
          }
        }
        return this;
      }.bind(this);
    }
  }

  /**
   * **Get** or **Set** the duration option value.
   *
   * As a **setter** it accepts three types of parameters:
   * 1. `number`: Sets the duration of the scene to exactly this amount of pixels.  
   *   This means the scene will last for exactly this amount of pixels scrolled. Sub-Pixels are also valid.
   *   A value of `0` means that the scene is 'open end' and no end will be triggered. Pins will never unpin and animations will play independently of scroll progress.
   * 2. `string`: Always updates the duration relative to parent scroll container.  
   *   For example `"100%"` will keep the duration always exactly at the inner height of the scroll container.
   *   When scrolling vertically the width is used for reference respectively.
   * 3. `function`: The supplied function will be called to return the scene duration.
   *   This is useful in setups where the duration depends on other elements who might change size. By supplying a function you can return a value instead of updating potentially multiple scene durations.  
   *   The scene can be referenced inside the callback using `this`.
   *   _**WARNING:** This is an easy way to kill performance, as the callback will be executed every time `Scene.refresh()` is called, which happens a lot. The interval is defined by the controller (see ScrollMagic.Controller option `refreshInterval`).  
   *   It's recomended to avoid calculations within the function and use cached variables as return values.  
   *   This counts double if you use the same function for multiple scenes._
   *
   * @method ScrollMagic.Scene#duration
   * @example
   * // get the current duration value
   * var duration = scene.duration();
   *
   * // set a new duration
   * scene.duration(300);
   *
   * // set duration responsively to container size
   * scene.duration("100%");
   *
   * // use a function to randomize the duration for some reason.
   * var durationValueCache;
   * function durationCallback () {
   *   return durationValueCache;
   * }
   * function updateDuration () {
   *   durationValueCache = Math.random() * 100;
   * }
   * updateDuration(); // set to initial value
   * scene.duration(durationCallback); // set duration callback
   *
   * @fires {@link Scene.change}, when used as setter
   * @fires {@link Scene.shift}, when used as setter
   * @param {(number|string|function)} [newDuration] - The new duration setting for the scene.
   * @returns {number} `get` -  Current scene duration.
   * @returns {Scene} `set` -  Parent object for chaining.
   */

  /**
   * **Get** or **Set** the offset option value.
   * @method ScrollMagic.Scene#offset
   * @example
   * // get the current offset
   * var offset = scene.offset();
   *
     * // set a new offset
   * scene.offset(100);
   *
   * @fires {@link Scene.change}, when used as setter
   * @fires {@link Scene.shift}, when used as setter
   * @param {number} [newOffset] - The new offset of the scene.
   * @returns {number} `get` -  Current scene offset.
   * @returns {Scene} `set` -  Parent object for chaining.
   */

  /**
   * **Get** or **Set** the triggerElement option value.
   * Does **not** fire `Scene.shift`, because changing the trigger Element doesn't necessarily mean the start position changes. This will be determined in `Scene.refresh()`, which is automatically triggered.
   * @method ScrollMagic.Scene#triggerElement
   * @example
   * // get the current triggerElement
   * var triggerElement = scene.triggerElement();
   *
     * // set a new triggerElement using a selector
   * scene.triggerElement("#trigger");
     * // set a new triggerElement using a DOM object
   * scene.triggerElement(document.getElementById("trigger"));
   *
   * @fires {@link Scene.change}, when used as setter
   * @param {(string|object)} [newTriggerElement] - The new trigger element for the scene.
   * @returns {(string|object)} `get` -  Current triggerElement.
   * @returns {Scene} `set` -  Parent object for chaining.
   */

  /**
   * **Get** or **Set** the triggerHook option value.
   * @method ScrollMagic.Scene#triggerHook
   * @example
   * // get the current triggerHook value
   * var triggerHook = scene.triggerHook();
   *
     * // set a new triggerHook using a string
   * scene.triggerHook("onLeave");
     * // set a new triggerHook using a number
   * scene.triggerHook(0.7);
   *
   * @fires {@link Scene.change}, when used as setter
   * @fires {@link Scene.shift}, when used as setter
   * @param {(number|string)} [newTriggerHook] - The new triggerHook of the scene. See {@link Scene} parameter description for value options.
   * @returns {number} `get` -  Current triggerHook (ALWAYS numerical).
   * @returns {Scene} `set` -  Parent object for chaining.
   */

  /**
   * **Get** or **Set** the reverse option value.
   * @method ScrollMagic.Scene#reverse
   * @example
   * // get the current reverse option
   * var reverse = scene.reverse();
   *
     * // set new reverse option
   * scene.reverse(false);
   *
   * @fires {@link Scene.change}, when used as setter
   * @param {boolean} [newReverse] - The new reverse setting of the scene.
   * @returns {boolean} `get` -  Current reverse option value.
   * @returns {Scene} `set` -  Parent object for chaining.
   */

  /**
   * **Get** or **Set** the loglevel option value.
   * @method ScrollMagic.Scene#loglevel
   * @example
   * // get the current loglevel
   * var loglevel = scene.loglevel();
   *
     * // set new loglevel
   * scene.loglevel(3);
   *
   * @fires {@link Scene.change}, when used as setter
   * @param {number} [newLoglevel] - The new loglevel setting of the scene. `[0-3]`
   * @returns {number} `get` -  Current loglevel.
   * @returns {Scene} `set` -  Parent object for chaining.
   */

  /**
   * **Get** the associated controller.
   * @method ScrollMagic.Scene#controller
   * @example
   * // get the controller of a scene
   * var controller = scene.controller();
   *
   * @returns {ScrollMagic.Controller} Parent controller or `undefined`
   */
  controller() {
    return this._controller;
  }

  /**
   * **Get** the current state.
   * @method ScrollMagic.Scene#state
   * @example
   * // get the current state
   * var state = scene.state();
   *
   * @returns {string} `"BEFORE"`, `"DURING"` or `"AFTER"`
   */
  state() {
    return this._state;
  }

  /**
   * **Get** the current scroll offset for the start of the scene.  
   * Mind, that the scrollOffset is related to the size of the container, if `triggerHook` is bigger than `0` (or `"onLeave"`).  
   * This means, that resizing the container or changing the `triggerHook` will influence the scene's start offset.
   * @method ScrollMagic.Scene#scrollOffset
   * @example
   * // get the current scroll offset for the start and end of the scene.
   * var start = scene.scrollOffset();
   * var end = scene.scrollOffset() + scene.duration();
   * console.log("the scene starts at", start, "and ends at", end);
   *
   * @returns {number} The scroll offset (of the container) at which the scene will trigger. Y value for vertical and X value for horizontal scrolls.
   */
  scrollOffset() {
    return this._scrollOffset.start;
  }

  /**
   * **Get** the trigger position of the scene (including the value of the `offset` option).  
   * @method ScrollMagic.Scene#triggerPosition
   * @example
   * // get the scene's trigger position
   * var triggerPosition = scene.triggerPosition();
   *
   * @returns {number} Start position of the scene. Top position value for vertical and left position value for horizontal scrolls.
   */
  triggerPosition() {
    let pos = this._options.offset; // The offset is the basis
    if (this._controller) {
      // Get the trigger position
      if (this._options.triggerElement) {
        // Element as trigger
        pos += this._triggerPos;
      } else {
        // Return the height of the triggerHook to start at the beginning
        pos += this._controller.info("size") * this.triggerHook();
      }
    }
    return pos;
  }

  /**
   * Update the pin state.
   * @private
   */
  updatePinState(forceUnpin) {
    if (this._pin && this._controller) {
      let containerInfo = this._controller.info();
      let pinTarget = this._pinOptions.spacer.firstChild; // May be pin element or another spacer, if cascading pins

      if (!forceUnpin && this._state === SCENE.SCENE_STATE_DURING) { // During scene or if duration is 0 and we are past the trigger
        // Pinned state
        if (_util.css(pinTarget, "position") != "fixed") {
          // Change state before updating pin spacer (position changes due to fixed collapsing might occur.)
          _util.css(pinTarget, { "position": "fixed" });
          // Update pin spacer
          this.updatePinDimensions();
        }

        let fixedPos = _util.get.offset(this._pinOptions.spacer, true); // get viewport position of spacer
        let scrollDistance = this._options.reverse || this._options.duration === 0 ?
                    containerInfo.scrollPos - this._scrollOffset.start // quicker
                  : Math.round(this._progress * _options.duration * 10)/10; // if no reverse and during pin the position needs to be recalculated using the progress
        
        // Add scrollDistance
        fixedPos[containerInfo.vertical ? "top" : "left"] += scrollDistance;

        // Set new values
        _util.css(this._pinOptions.spacer.firstChild, {
          top: fixedPos.top,
          left: fixedPos.left
        });
      } else {
        // Unpinned state
        let newCSS = {
            position: this._pinOptions.inFlow ? "relative" : "absolute",
            top:  0,
            left: 0
          },
          change = _util.css(pinTarget, "position") != newCSS.position;
        
        if (!this._pinOptions.pushFollowers) {
          newCSS[containerInfo.vertical ? "top" : "left"] = this._options.duration * this._progress;
        } else if (this._options.duration > 0) { // only concerns scenes with duration
          if (this._state === SCENE.SCENE_STATE_AFTER && parseFloat(_util.css(this._pinOptions.spacer, "padding-top")) === 0) {
            change = true; // if in after state but havent updated spacer yet (jumped past pin)
          } else if (this._state === SCENE.SCENE_STATE_BEFORE && parseFloat(_util.css(this._pinOptions.spacer, "padding-bottom")) === 0) { // before
            change = true; // jumped past fixed state upward direction
          }
        }
        // set new values
        _util.css(pinTarget, newCSS);
        if (change) {
          // update pin spacer if state changed
          this.updatePinDimensions();
        }
      }
    }
  }

  /**
   * Update the pin spacer and/or element size.
   * The size of the spacer needs to be updated whenever the duration of the scene changes, if it is to push down following elements.
   * @private
   */
  updatePinDimensions() {
    if (this._pin && this._controller && this._pinOptions.inFlow) { // No spacerresize, if original position is absolute
      let after = (this._state === SCENE.SCENE_STATE_AFTER);
      let before = (this._state === SCENE.SCENE_STATE_BEFORE);
      let during = (this._state === SCENE.SCENE_STATE_DURING);
      let vertical = this._controller.info("vertical");
      let pinTarget = this._pinOptions.spacer.firstChild; // Usually the pined element but can also be another spacer (cascaded pins)
      let marginCollapse = _util.isMarginCollapseType(_util.css(this._pinOptions.spacer, "display"));
      let css = {};

      // Set new size
      // if relsize: spacer -> pin | else: pin -> spacer
      if (this._pinOptions.relSize.width || this._pinOptions.relSize.autoFullWidth) {
        if (during) {
          _util.css(this._pin, {"width": _util.get.width(this._pinOptions.spacer)});
        } else {
          _util.css(this._pin, {"width": "100%"});
        }
      } else {
        // minwidth is needed for cascaded pins.
        css["min-width"] = _util.get.width(vertical ? this._pin : pinTarget, true, true);
        css.width = during ? css["min-width"] : "auto";
      }

      if (this._pinOptions.relSize.height) {
        if (during) {
          // the only padding the spacer should ever include is the duration (if pushFollowers = true), so we need to substract that.
          _util.css(this._pin, {"height": _util.get.height(this._pinOptions.spacer) - (this._pinOptions.pushFollowers ? this._options.duration : 0)});
        } else {
          _util.css(this._pin, {"height": "100%"});
        }
      } else {
        // margin is only included if it's a cascaded pin to resolve an IE9 bug
        css["min-height"] = _util.get.height(vertical ? pinTarget : this._pin, true , !marginCollapse); // needed for cascading pins
        css.height = during ? css["min-height"] : "auto";
      }

      // add space for duration if pushFollowers is true
      if (this._pinOptions.pushFollowers) {
        css["padding" + (vertical ? "Top" : "Left")] = this._options.duration * this._progress;
        css["padding" + (vertical ? "Bottom" : "Right")] = this._options.duration * (1 - this._progress);
      }

      _util.css(this._pinOptions.spacer, css);
    }
  }

  /**
   * Updates the Pin state (in certain scenarios)
   * If the controller container is not the document and we are mid-pin-phase scrolling or resizing the main document can result to wrong pin positions.
   * So this function is called on resize and scroll of the document.
   * @private
   */
  updatePinInContainer() {
    if (this._controller && this._pin && this._state === SCENE.SCENE_STATE_DURING && !this._controller.info("isDocument")) {
      this.updatePinState();
    }
  }

  /**
   * Updates the Pin spacer size state (in certain scenarios)
   * If container is resized during pin and relatively sized the size of the pin might need to be updated...
   * So this function is called on resize of the container.
   * @private
   */
  updateRelativePinSpacer() {
    if (this._controller && this._pin && // well, duh
        this._state === SCENE.SCENE_STATE_DURING && // element in pinned state?
        ( // is width or height relatively sized, but not in relation to body? then we need to recalc.
          ((this._pinOptions.relSize.width || this._pinOptions.relSize.autoFullWidth) && _util.get.width(window) != _util.get.width(this._pinOptions.spacer.parentNode)) ||
          (this._pinOptions.relSize.height && _util.get.height(window) != _util.get.height(this._pinOptions.spacer.parentNode))
        )
    ) {
      this.updatePinDimensions();
    }
  }

  /**
   * Is called, when the mousewhel is used while over a pinned element inside a div container.
   * If the scene is in fixed state scroll events would be counted towards the body. This forwards the event to the scroll container.
   * @private
   */
  onMousewheelOverPin(e) {
    if (this._controller && this._pin && this._state === SCENE.SCENE_STATE_DURING && !this._controller.info("isDocument")) { // in pin state
      e.preventDefault();
      this._controller.setScrollPos(this._controller.info("scrollPos") - ((e.wheelDelta || e[this._controller.info("vertical") ? "wheelDeltaY" : "wheelDeltaX"])/3 || -e.detail*30));
    }
  }

  /**
   * Pin an element for the duration of the scene.
   * If the scene duration is 0 the element will only be unpinned, if the user scrolls back past the start position.  
   * Make sure only one pin is applied to an element at the same time.
   * An element can be pinned multiple times, but only successively.
   * _**NOTE:** The option `pushFollowers` has no effect, when the scene duration is 0._
   * @method ScrollMagic.Scene#setPin
   * @example
   * // pin element and push all following elements down by the amount of the pin duration.
   * scene.setPin("#pin");
   *
   * // pin element and keeping all following elements in their place. The pinned element will move past them.
   * scene.setPin("#pin", {pushFollowers: false});
   *
   * @param {(string|object)} element - A Selector targeting an element or a DOM object that is supposed to be pinned.
   * @param {object} [settings] - settings for the pin
   * @param {boolean} [settings.pushFollowers=true] - If `true` following elements will be "pushed" down for the duration of the pin, if `false` the pinned element will just scroll past them.  
                             Ignored, when duration is `0`.
  * @param {string} [settings.spacerClass="scrollmagic-pin-spacer"] - Classname of the pin spacer element, which is used to replace the element.
  *
  * @returns {Scene} Parent object for chaining.
  */
  setPin(element, settings) {
    let defaultSettings = {
      pushFollowers: true,
      spacerClass: "scrollmagic-pin-spacer"
    };

    // (BUILD) - REMOVE IN MINIFY - START
    let pushFollowersActivelySet = settings && settings.hasOwnProperty('pushFollowers');
    // (BUILD) - REMOVE IN MINIFY - END
    settings = _util.extend({}, defaultSettings, settings);

    // validate Element
    element = _util.get.elements(element)[0];
    if (!element) {
      this.log(1, "ERROR calling method 'setPin()': Invalid pin element supplied.");
      return this; // cancel
    } else if (_util.css(element, "position") === "fixed") {
      this.log(1, "ERROR calling method 'setPin()': Pin does not work with elements that are positioned 'fixed'.");
      return this; // cancel
    }

    if (this._pin) { // preexisting pin?
      if (this._pin === element) {
        // same pin we already have -> do nothing
        return this; // cancel
      } else {
        // kill old pin
        this.removePin();
      }
    }
    this._pin = element;
    
    let parentDisplay = this._pin.parentNode.style.display;
    let boundsParams = ["top", "left", "bottom", "right", "margin", "marginLeft", "marginRight", "marginTop", "marginBottom"];

    this._pin.parentNode.style.display = 'none'; // hack start to force css to return stylesheet values instead of calculated px values.

    let inFlow = _util.css(this._pin, "position") != "absolute";
    let pinCSS = _util.css(this._pin, boundsParams.concat(["display"]));
    let sizeCSS = _util.css(this._pin, ["width", "height"]);

    this._pin.parentNode.style.display = parentDisplay; // hack end.

    if (!inFlow && settings.pushFollowers) {
      this.log(2, "WARNING: If the pinned element is positioned absolutely pushFollowers will be disabled.");
      settings.pushFollowers = false;
    }

    // (BUILD) - REMOVE IN MINIFY - START
    window.setTimeout(function () { // wait until all finished, because with responsive duration it will only be set after scene is added to controller
      if (this._pin && this._options.duration === 0 && pushFollowersActivelySet && settings.pushFollowers) {
        this.log(2, "WARNING: pushFollowers =", true, "has no effect, when scene duration is 0.");
      }
    }, 0);
    // (BUILD) - REMOVE IN MINIFY - END

    // Create spacer and insert
    let spacer = this._pin.parentNode.insertBefore(document.createElement('div'), this._pin);
    let spacerCSS = _util.extend(pinCSS, {
      position: inFlow ? "relative" : "absolute",
      boxSizing: "content-box",
      mozBoxSizing: "content-box",
      webkitBoxSizing: "content-box"
    });

    if (!inFlow) { // Copy size if positioned absolutely, to work for bottom/right positioned elements.
      _util.extend(spacerCSS, _util.css(this._pin, ["width", "height"]));
    }

    _util.css(spacer, spacerCSS);
    spacer.setAttribute(PIN_SPACER_ATTRIBUTE, "");
    _util.addClass(spacer, settings.spacerClass);

    // Set the pin Options
    this._pinOptions = {
      spacer: spacer,
      relSize: { // Save if size is defined using % values. if so, handle spacer resize differently...
        width: sizeCSS.width.slice(-1) === "%",
        height: sizeCSS.height.slice(-1) === "%",
        autoFullWidth: sizeCSS.width === "auto" && inFlow && _util.isMarginCollapseType(pinCSS.display)
      },
      pushFollowers: settings.pushFollowers,
      inFlow: inFlow // Stores if the element takes up space in the document flow
    };
    
    if (!this._pin.___origStyle) {
      this._pin.___origStyle = {};
      let pinInlineCSS = this._pin.style;
      let copyStyles = boundsParams.concat(["width", "height", "position", "boxSizing", "mozBoxSizing", "webkitBoxSizing"]);
      copyStyles.forEach((val) => {
        this._pin.___origStyle[val] = pinInlineCSS[val] || "";
      });
    }

    // If relative size, transfer it to spacer and make pin calculate it...
    if (this._pinOptions.relSize.width) {
      _util.css(spacer, { width: sizeCSS.width });
    }
    if (this._pinOptions.relSize.height) {
      _util.css(spacer, {height: sizeCSS.height});
    }

    // Now place the pin element inside the spacer
    spacer.appendChild(this._pin);

    // and set new css
    _util.css(this._pin, {
      position: inFlow ? "relative" : "absolute",
      margin: "auto",
      top: "auto",
      left: "auto",
      bottom: "auto",
      right: "auto"
    });
    
    if (this._pinOptions.relSize.width || this._pinOptions.relSize.autoFullWidth) {
      _util.css(this._pin, {
        boxSizing : "border-box",
        mozBoxSizing : "border-box",
        webkitBoxSizing : "border-box"
      });
    }

    // Add listener to document to update pin position in case controller is not the document.
    window.addEventListener('scroll', this.updatePinInContainer.bind(this));
    window.addEventListener('resize', this.updatePinInContainer.bind(this));
    window.addEventListener('resize', this.updateRelativePinSpacer.bind(this));

    // Add mousewheel listener to catch scrolls over fixed elements
    this._pin.addEventListener("mousewheel", this.onMousewheelOverPin.bind(this));
    this._pin.addEventListener("DOMMouseScroll", this.onMousewheelOverPin.bind(this));

    this.log(3, "Added pin");

    // Finally update the pin to init
    this.updatePinState();

    return this;
  }

  /**
   * Remove the pin from the scene.
   * @method ScrollMagic.Scene#removePin
   * @example
   * // remove the pin from the scene without resetting it (the spacer is not removed)
   * scene.removePin();
   *
   * // remove the pin from the scene and reset the pin element to its initial position (spacer is removed)
   * scene.removePin(true);
   *
   * @param {boolean} [reset=false] - If `false` the spacer will not be removed and the element's position will not be reset.
   * @returns {Scene} Parent object for chaining.
   */
  removePin(reset) {
    if (this._pin) {
      if (this._state === SCENE.SCENE_STATE_DURING) {
        this.updatePinState(true); // Force unpin at position
      }
      if (reset || !this._controller) { // If there's no controller no progress was made anyway...
        let pinTarget = this._pinOptions.spacer.firstChild; // Usually the pin element, but may be another spacer (cascaded pins)...
        if (pinTarget.hasAttribute(PIN_SPACER_ATTRIBUTE)) { // Copy margins to child spacer
          let style = this._pinOptions.spacer.style;
          let values = ["margin", "marginLeft", "marginRight", "marginTop", "marginBottom"];
          let margins = {};
          values.forEach(function (val) {
            margins[val] = style[val] || "";
          });
          _util.css(pinTarget, margins);
        }
        this._pinOptions.spacer.parentNode.insertBefore(pinTarget, this._pinOptions.spacer);
        this._pinOptions.spacer.parentNode.removeChild(this._pinOptions.spacer);
        if (!this._pin.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE)) { // If it's the last pin for this element -> restore inline styles
          // TODO: only correctly set for first pin (when cascading) - how to fix?
          _util.css(this._pin, this._pin.___origStyle);
          delete this._pin.___origStyle;
        }
      }
      window.removeEventListener('scroll', this.updatePinInContainer);
      window.removeEventListener('resize', this.updatePinInContainer);
      window.removeEventListener('resize', this.updateRelativePinSpacer);

      this._pin.removeEventListener("mousewheel", this.onMousewheelOverPin);
      this._pin.removeEventListener("DOMMouseScroll", this.onMousewheelOverPin);

      this._pin = undefined;

      this.log(3, "removed pin (reset: " + (reset ? "true" : "false") + ")");
    }

    return this;
  }

  /**
   * Define a css class modification while the scene is active.  
   * When the scene triggers the classes will be added to the supplied element and removed, when the scene is over.
   * If the scene duration is 0 the classes will only be removed if the user scrolls back past the start position.
   * @method ScrollMagic.Scene#setClassToggle
   * @example
   * // add the class 'myclass' to the element with the id 'my-elem' for the duration of the scene
   * scene.setClassToggle("#my-elem", "myclass");
   *
   * // add multiple classes to multiple elements defined by the selector '.classChange'
   * scene.setClassToggle(".classChange", "class1 class2 class3");
   *
   * @param {(string|object)} element - A Selector targeting one or more elements or a DOM object that is supposed to be modified.
   * @param {string} classes - One or more Classnames (separated by space) that should be added to the element during the scene.
   *
   * @returns {Scene} Parent object for chaining.
   */
  setClassToggle(element, classes) {
    let elems = _util.get.elements(element);

    if (elems.length === 0 || !_util.type.String(classes)) {
      this.log(1, "ERROR calling method 'setClassToggle()': Invalid " + (elems.length === 0 ? "element" : "classes") + " supplied.");
      return this;
    }

    if (this._cssClassElems.length > 0) {
      // Remove old ones
      this.removeClassToggle();
    }

    this._cssClasses = classes;
    this._cssClassElems = elems;

    this.on("enter.internal_class leave.internal_class", (e) => {
      let toggle = e.type === "enter" ? _util.addClass : _util.removeClass;
      this._cssClassElems.forEach((elem, key) => {
        this.toggle(elem, this._cssClasses);
      });
    });

    return this;
  }

  /**
   * Remove the class binding from the scene.
   * @method ScrollMagic.Scene#removeClassToggle
   * @example
   * // remove class binding from the scene without reset
   * scene.removeClassToggle();
   *
   * // remove class binding and remove the changes it caused
   * scene.removeClassToggle(true);
   *
   * @param {boolean} [reset=false] - If `false` and the classes are currently active, they will remain on the element. If `true` they will be removed.
   * @returns {Scene} Parent object for chaining.
   */
  removeClassToggle(reset) {
    if (reset) {
      this._cssClassElems.forEach((elem, key) => {
        _util.removeClass(elem, this._cssClasses);
      });
    }

    this.off("start.internal_class end.internal_class");

    this._cssClasses = undefined;
    this._cssClassElems = [];

    return this;
  }

  // Start - Animation GSAP plugin

  /**
   * Update the tween progress to current position.
   * @private
   */
  updateTweenProgress() {
    if (this._tween) {
      let progress = this.progress();
      let state = this.state();

      if (this._tween.repeat && this._tween.repeat() === -1) {
        // Infinite loop, so not in relation to progress
        if (state === 'DURING' && this._tween.paused()) {
          this._tween.play();
        } else if (state !== 'DURING' && !this._tween.paused()) {
          this._tween.pause();
        }
      } else if (progress != this._tween.progress()) { // Do we even need to update the progress?
        // No infinite loop - so should we just play or go to a specific point in time?
        if (this.duration() === 0) {
          // Play the animation
          if (progress > 0) { // Play from 0 to 1
            this._tween.play();
          } else { // Play from 1 to 0
            this._tween.reverse();
          }
        } else {
          // Go to a specific point in time
          if (this.tweenChanges() && this._tween.tweenTo) {
            // Go smooth
            this._tween.tweenTo(progress * this._tween.duration());
          } else {
            //Just hard set it
            this._tween.progress(progress).pause();
          }
        }
      }
    }
  }

  /**
   * Add a tween to the scene.  
   * If you want to add multiple tweens, add them into a GSAP Timeline object and supply it instead (see example below).  
   * 
   * If the scene has a duration, the tween's duration will be projected to the scroll distance of the scene, meaning its progress will be synced to scrollbar movement.  
   * For a scene with a duration of `0`, the tween will be triggered when scrolling forward past the scene's trigger position and reversed, when scrolling back.  
   * To gain better understanding, check out the [Simple Tweening example](../examples/basic/simple_tweening.html).
   *
   * Instead of supplying a tween this method can also be used as a shorthand for `TweenMax.to()` (see example below).
   * @memberof! animation.GSAP#
   *
   * @example
   * // add a single tween directly
   * scene.setTween(TweenMax.to("obj"), 1, {x: 100});
   *
   * // add a single tween via variable
   * var tween = TweenMax.to("obj"), 1, {x: 100};
   * scene.setTween(tween);
   *
   * // add multiple tweens, wrapped in a timeline.
   * var timeline = new TimelineMax();
   * var tween1 = TweenMax.from("obj1", 1, {x: 100});
   * var tween2 = TweenMax.to("obj2", 1, {y: 100});
   * timeline
   *		.add(tween1)
    *		.add(tween2);
    * scene.addTween(timeline);
    *
    * // short hand to add a TweenMax.to() tween
    * scene.setTween("obj3", 0.5, {y: 100});
    *
    * // short hand to add a TweenMax.to() tween for 1 second
    * // this is useful, when the scene has a duration and the tween duration isn't important anyway
    * scene.setTween("obj3", {y: 100});
    *
    * @param {(object|string)} TweenObject - A TweenMax, TweenLite, TimelineMax or TimelineLite object that should be animated in the scene. Can also be a Dom Element or Selector, when using direct tween definition (see examples).
    * @param {(number|object)} duration - A duration for the tween, or tween parameters. If an object containing parameters are supplied, a default duration of 1 will be used.
    * @param {object} params - The parameters for the tween
    * @returns {Scene} Parent object for chaining.
    */
  setTween(TweenObject, duration, params) {
    let newTween;

    if (arguments.length > 1) {
      let durationIsSet = typeof arguments['1'] === 'number';

      if (GSAP3_OR_GREATER) {
        // If we're using gsap 3 with proper gsap 3 syntax of 2 arguments
        if (!durationIsSet) {
          params = duration;
        }
        // Add a duration is there isn't one
        if (!params.hasOwnProperty('duration')) {
          params.duration = durationIsSet ? duration : 1;
        }
      } else {
        // If we're using gsap 2 or earlier syntax
        if (arguments.length < 3) {
          params = duration;
          duration = 1;
        }
      }

      // 2 arguments should be gsap 3 syntax, and 3 arguments for 
      TweenObject = GSAP3_OR_GREATER ? Tween.to(TweenObject, params) : Tween.to(TweenObject, duration, params);
    }
    try {
      // wrap Tween into a Timeline Object if not gsap 3 or greater and available to include delay and repeats in the duration and standardize methods.
      if (TimelineMax && !GSAP3_OR_GREATER) {
        newTween = new TimelineMax({ smoothChildTiming: true }).add(TweenObject);
      } else {
        newTween = TweenObject;
      }
      newTween.pause();
    } catch (e) {
      this.log(1, "ERROR calling method 'setTween()': Supplied argument is not a valid TweenObject");
      return this;
    }

    if (this._tween) { // kill old tween?
      this.removeTween();
    }

    this._tween = newTween;

    // Some properties need to be transferred it to the wrapper, otherwise they would get lost.
    if (TweenObject.repeat && TweenObject.repeat() === -1) {// TweenMax or TimelineMax Object?
      this._tween.repeat(-1);
      this._tween.yoyo(TweenObject.yoyo());
    }

    // (BUILD) - REMOVE IN MINIFY - START
    // Some tween validations and debugging helpers

    if (this.tweenChanges() && !this._tween.tweenTo) {
      this.log(2, "WARNING: tweenChanges will only work if the TimelineMax object is available for ScrollMagic.");
    }

    // Check if there are position tweens defined for the trigger and warn about it :)
    if (this._tween && this.controller()  && this.triggerElement() && this.loglevel() >= 2) { // Controller is needed to know scroll direction.
      let triggerTweens = Tween.getTweensOf(this.triggerElement());
      let vertical = this.controller().info("vertical");

      triggerTweens.forEach((value, index) => {
        let tweenvars = value.vars.css || value.vars;
        let condition = vertical ? (tweenvars.top !== undefined || tweenvars.bottom !== undefined) : (tweenvars.left !== undefined || tweenvars.right !== undefined);

        if (condition) {
          this.log(2, "WARNING: Tweening the position of the trigger element affects the scene timing and should be avoided!");
          return false;
        }
      });
    }

    // Warn about tween overwrites, when an element is tweened multiple times
    if (parseFloat(TweenLite.version) >= 1.14) { // onOverwrite only present since GSAP v1.14.0
      // However, onInterrupt deprecated onOverwrite in GSAP v3
      let methodUsed = GSAP3_OR_GREATER ? 'onInterrupt' : 'onOverwrite';
      let list = this._tween.getChildren ? this._tween.getChildren(true, true, false) : [this._tween]; // get all nested tween objects

      let newCallback = () => {
        this.log(2, "WARNING: tween was overwritten by another. To learn how to avoid this issue see here: https://github.com/janpaepke/ScrollMagic/wiki/WARNING:-tween-was-overwritten-by-another");
      };

      for (let i=0, thisTween, oldCallback; i < list.length; i++) {
        thisTween = list[i];

        if (oldCallback !== newCallback) { // if tweens is added more than once
          oldCallback = thisTween.vars[methodUsed];

          thisTween.vars[methodUsed] = function () {
            if (oldCallback) {
              oldCallback.apply(this, arguments);
            }
            newCallback.apply(this, arguments);
          };
        }
      }
    }
  
    // (BUILD) - REMOVE IN MINIFY - END
    this.log(3, "Added tween");

    this.updateTweenProgress();

    return this;
  }

  /**
   * Remove the tween from the scene.
   * This will terminate the control of the Scene over the tween.
   *
   * Using the reset option you can decide if the tween should remain in the current state or be rewound to set the target elements back to the state they were in before the tween was added to the scene.
   * @memberof! animation.GSAP#
   *
   * @example
   * // remove the tween from the scene without resetting it
   * scene.removeTween();
   *
   * // remove the tween from the scene and reset it to initial position
   * scene.removeTween(true);
   *
   * @param {boolean} [reset=false] - If `true` the tween will be reset to its initial values.
   * @returns {Scene} Parent object for chaining.
   */
  removeTween(reset) {
    if (this._tween) {
      if (reset) {
        this._tween.progress(0).pause();
      }
      this._tween.kill();
      this._tween = undefined;
      this.log(3, "removed tween (reset: " + (reset ? "true" : "false") + ")");
    }
    return this;
  }

  // End - Animation GSAP plugin

  // Start - Debug plugin

  /**
   * Add visual indicators for a ScrollMagic.Scene.  
   * @memberof! debug.addIndicators#
   *
   * @example
   * // add basic indicators
   * scene.addIndicators()
   *
   * // passing options
   * scene.addIndicators({name: "pin scene", colorEnd: "#FFFFFF"});
   *
   * @param {object} [options] - An object containing one or more options for the indicators.
   * @param {(string|object)} [options.parent] - A selector, DOM Object or a jQuery object that the indicators should be added to.  
                                                           If undefined, the controller's container will be used.
    * @param {number} [options.name=""] - This string will be displayed at the start and end indicators of the scene for identification purposes. If no name is supplied an automatic index will be used.
    * @param {number} [options.indent=0] - Additional position offset for the indicators (useful, when having multiple scenes starting at the same position).
    * @param {string} [options.colorStart=green] - CSS color definition for the start indicator.
    * @param {string} [options.colorEnd=red] - CSS color definition for the end indicator.
    * @param {string} [options.colorTrigger=blue] - CSS color definition for the trigger indicator.
    */
  addIndicators(options) {
    if (!this._indicator) {
      const DEFAULT_OPTIONS = {
        name: "",
        indent: 0,
        parent: undefined,
        colorStart: "green",
        colorEnd: "red",
        colorTrigger: "blue",
      };
      
      options = _util.extend({}, DEFAULT_OPTIONS, options);

      this._autoindex++;
      this._indicator = new Indicator(this, options, this._autoindex);

      this.on("add.plugin_addIndicators", this._indicator.add.bind(this._indicator));
      this.on("remove.plugin_addIndicators", this._indicator.remove.bind(this._indicator));
      this.on("destroy.plugin_addIndicators", this.removeIndicators.bind(this));

      // It the scene already has a controller we can start right away.
      if (this.controller()) {
        this._indicator.add();
      }
    }

    return this;
  }

  /**
   * Removes visual indicators from a ScrollMagic.Scene.
   * @memberof! debug.addIndicators#
   *
   * @example
   * // remove previously added indicators
   * scene.removeIndicators()
   *
   */
  removeIndicators() {
    if (this._indicator) {
      this._indicator.remove();
      this.off("*.plugin_addIndicators");
      this._indicator = undefined;
    }
    return this;
  }

  // End - Debug plugin
}

export default Scene;
