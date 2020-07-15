import { _util } from './util';
import Scene from './Scene';

const FONT_SIZE = "0.85em";
const ZINDEX = "9999";
const EDGE_OFFSET = 15; // minimum edge distance, added to indentation

/*
  * ----------------------------------------------------------------
  * Templates for the indicators
  * ----------------------------------------------------------------
  */
var TPL = {
  start: function (color) {
    // inner element (for bottom offset -1, while keeping top position 0)
    var inner = document.createElement("div");
    inner.textContent = "start";
    _util.css(inner, {
      position: "absolute",
      overflow: "visible",
      "border-width" : 0,
      "border-style" : "solid",
      color: color,
      "border-color" : color
    });
    var e = document.createElement('div');
    // wrapper
    _util.css(e, {
      position: "absolute",
      overflow: "visible",
      width: 0,
      height: 0
    });
    e.appendChild(inner);
    return e;
  },
  end: function (color) {
    var e = document.createElement('div');
    e.textContent = "end";
    _util.css(e, {
      position: "absolute",
      overflow: "visible",
      "border-width" : 0,
      "border-style" : "solid",
      color: color,
      "border-color" : color
    });
    return e;
  },
  bounds: function () {
    var e = document.createElement('div');
    _util.css(e, {
      position: "absolute",
      overflow: "visible",
      "white-space": "nowrap",
      "pointer-events" : "none",
      "font-size": FONT_SIZE
    });
    e.style.zIndex = ZINDEX;
    return e;
  },
  trigger: function (color) {
    // inner to be above or below line but keep position
    var inner = document.createElement('div');
    inner.textContent = "trigger";
    _util.css(inner, {
      position: "relative",
    });
    // inner wrapper for right: 0 and main element has no size
    var w = document.createElement('div'); 
    _util.css(w, {
      position: "absolute",
      overflow: "visible",
      "border-width" : 0,
      "border-style" : "solid",
      color: color,
      "border-color" : color
    });
    w.appendChild(inner);
    // wrapper
    var e = document.createElement('div');
    _util.css(e, {
      position: "fixed",
      overflow: "visible",
      "white-space": "nowrap",
      "pointer-events" : "none",
      "font-size": FONT_SIZE
    });
    e.style.zIndex = ZINDEX;
    e.appendChild(w);
    return e;
  },
};

class Indicator {
  constructor(scene, options, autoindex) {
    this.scene = scene;
    this._elemBounds = TPL.bounds();
    this._elemStart = TPL.start(options.colorStart);
    this._elemEnd = TPL.end(options.colorEnd);
    this._boundsContainer = options.parent && _util.get.elements(options.parent)[0];
    this._vertical;
    this._ctrl;

    options.name = options.name || autoindex;

    // Prepare bounds elements
    this._elemStart.firstChild.textContent += " " + options.name;
    this._elemEnd.textContent += " " + options.name;
    this._elemBounds.appendChild(this._elemStart);
    this._elemBounds.appendChild(this._elemEnd);

    // Set public variables
    this.options = options;
    this.bounds = this._elemBounds;

    // Will be set later
    this.triggerGroup = undefined;
  }

  // Add indicators to DOM
  add() {
    this._ctrl = this.scene.controller();
    this._vertical = this._ctrl.info("vertical");

    let isDocument = this._ctrl.info("isDocument");

    if (!this._boundsContainer) {
      // No parent supplied or doesnt exist
      this._boundsContainer = isDocument ? document.body : this._ctrl.info("container"); // Check if window/document (then use body)
    }

    if (!isDocument && _util.css(this._boundsContainer, "position") === 'static') {
      // Position mode needed for correct positioning of indicators
      _util.css(this._boundsContainer, { position: "relative" });
    }

    // Add listeners for updates
    this.scene.on("change.plugin_addIndicators", this.handleTriggerParamsChange.bind(this));
    this.scene.on("shift.plugin_addIndicators", this.handleBoundsParamsChange.bind(this));

    // Updates trigger & bounds (will add elements if needed)
    this.updateTriggerGroup();
    this.updateBounds();

    setTimeout(() => { // Do after all execution is finished otherwise sometimes size calculations are off
      this._ctrl._indicators.updateBoundsPositions(this);
    }, 0);

    this.log(3, "Added indicators");
  }

  // Remove indicators from DOM
  remove() {
    if (this.triggerGroup) { // If not set there's nothing to remove
      this.scene.off("change.plugin_addIndicators", this.handleTriggerParamsChange);
      this.scene.off("shift.plugin_addIndicators", this.handleBoundsParamsChange);

      if (this.triggerGroup.members.length > 1) {
        // Just remove from memberlist of old group
        let group = this.triggerGroup;
        group.members.splice(group.members.indexOf(this), 1);
        this._ctrl._indicators.updateTriggerGroupLabel(group);
        this._ctrl._indicators.updateTriggerGroupPositions(group);
        this.triggerGroup = undefined;
       } else {
         // Remove complete group
         this.removeTriggerGroup();
       }
      this.removeBounds();
      
      this.log(3, "removed indicators");
    }
  }

  /*
    * ----------------------------------------------------------------
    * Internal Event Handlers
    * ----------------------------------------------------------------
    */

  // Event handler for when bounds params change
  handleBoundsParamsChange() {
    this.updateBounds();
  }

  // Event handler for when trigger params change
  handleTriggerParamsChange(e) {
    if (e.what === "triggerHook") {
      this.updateTriggerGroup();
    }
  }

  /*
    * ----------------------------------------------------------------
    * Bounds (start / stop) management
    * ----------------------------------------------------------------
    */

  // Adds an new bounds elements to the array and to the DOM
  addBounds() {
    let v = this._ctrl.info("vertical");

    // Apply stuff we didn't know before...
    _util.css(this._elemStart.firstChild, {
      "border-bottom-width" : v ? 1 : 0,
      "border-right-width" :	v ? 0 : 1,
      "bottom":								v ? -1 : this.options.indent,
      "right":								v ? this.options.indent : -1,
      "padding":							v ? "0 8px" : "2px 4px",
    });

    _util.css(this._elemEnd, {
      "border-top-width" :		v ? 1 : 0,
      "border-left-width" : 	v ? 0 : 1,
      "top":									v ? "100%" : "",
      "right":								v ? this.options.indent : "",
      "bottom":								v ? "" : this.options.indent,
      "left":									v ? "" : "100%",
      "padding":							v ? "0 8px" : "2px 4px"
    });

    // Append
    this._boundsContainer.appendChild(this._elemBounds);
  }

  // Remove bounds from list and DOM
  removeBounds() {
    this._elemBounds.parentNode.removeChild(this._elemBounds);
  }

  // Update the start and end positions of the scene
  updateBounds() {
    if (this._elemBounds.parentNode !== this._boundsContainer) {
      this.addBounds(); // Add Bounds elements (start/end)
    }

    let  css = {};

    css[this._vertical ? "top" : "left"] = this.scene.triggerPosition();
    css[this._vertical ? "height" : "width"] = this.scene.duration();

    _util.css(this._elemBounds, css);

    _util.css(this._elemEnd, {
      display: this.scene.duration() > 0 ? "" : "none"
    });
  }

  /*
    * ----------------------------------------------------------------
    * Trigger and trigger group management
    * ----------------------------------------------------------------
    */

  // Adds an new trigger group to the array and to the DOM
  addTriggerGroup() {
    let triggerElem = TPL.trigger(this.options.colorTrigger); // new trigger element

    let css = {};
    css[this._vertical ? "right" : "bottom"] = 0;
    css[this._vertical ? "border-top-width" : "border-left-width"] = 1;

    _util.css(triggerElem.firstChild, css);

    _util.css(triggerElem.firstChild.firstChild, {
      padding: this._vertical ? "0 8px 3px 8px" : "3px 4px"
    });

    document.body.appendChild(triggerElem); // directly add to body

    let newGroup = {
      triggerHook: this.scene.triggerHook(),
      element: triggerElem,
      members: [this]
    };

    this._ctrl._indicators.groups.push(newGroup);

    this.triggerGroup = newGroup;

    // Update right away
    this._ctrl._indicators.updateTriggerGroupLabel(newGroup);
    this._ctrl._indicators.updateTriggerGroupPositions(newGroup);
  }

  removeTriggerGroup() {
    this._ctrl._indicators.groups.splice(this._ctrl._indicators.groups.indexOf(this.triggerGroup), 1);
    this.triggerGroup.element.parentNode.removeChild(this.triggerGroup.element);
    this.triggerGroup = undefined;
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
  updateTriggerGroup() {
    let triggerHook = this.scene.triggerHook();
    let closeEnough = 0.0001;

    // Have a group, check if it still matches
    if (this.triggerGroup) {
      if (Math.abs(this.triggerGroup.triggerHook - triggerHook) < closeEnough) {
        // _util.log(0, "trigger", options.name, "->", "no need to change, still in sync");
        return; // all good
      }
    }

    // Don't have a group, check if a matching one exists
    // _util.log(0, "trigger", options.name, "->", "out of sync!");
    let groups = this._ctrl._indicators.groups;
    let group;
    let i = groups.length;

    while (i--) {
      group = groups[i];

      if (Math.abs(group.triggerHook - triggerHook) < closeEnough) {
        // found a match!
        // _util.log(0, "trigger", options.name, "->", "found match");
        if (this.triggerGroup) { // do I have an old group that is out of sync?
          if (this.triggerGroup.members.length === 1) { // is it the only remaining group?
            // _util.log(0, "trigger", options.name, "->", "kill");
            // was the last member, remove the whole group
            this.removeTriggerGroup();
          } else {
            this.triggerGroup.members.splice(this.triggerGroup.members.indexOf(this), 1); // Just remove from memberlist of old group
            this._ctrl._indicators.updateTriggerGroupLabel(this.triggerGroup);
            this._ctrl._indicators.updateTriggerGroupPositions(this.triggerGroup);
            // _util.log(0, "trigger", options.name, "->", "removing from previous member list");
          }
        }

        // Join new group
        group.members.push(this);
        this.triggerGroup = group;
        this._ctrl._indicators.updateTriggerGroupLabel(group);

        return;
      }
    }

    // At this point I am obviously out of sync and don't match any other group
    if (this.triggerGroup) {
      if (this.triggerGroup.members.length === 1) {
        // _util.log(0, "trigger", options.name, "->", "updating existing");
        // out of sync but i'm the only member => just change and update
        this.triggerGroup.triggerHook = triggerHook;
        this._ctrl._indicators.updateTriggerGroupPositions(this.triggerGroup);
        return;
      } else {
        // _util.log(0, "trigger", options.name, "->", "removing from previous member list");
        this.triggerGroup.members.splice(this.triggerGroup.members.indexOf(this), 1); // Just remove from memberlist of old group
        this._ctrl._indicators.updateTriggerGroupLabel(this.triggerGroup);
        this._ctrl._indicators.updateTriggerGroupPositions(this.triggerGroup);
        this.triggerGroup = undefined; // Need a brand new group...
      }
    }
    // _util.log(0, "trigger", options.name, "->", "add a new one");
    // did not find any match, make new trigger group
    this.addTriggerGroup();
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
    if (this.scene._options.loglevel >= loglevel) {
      Array.prototype.splice.call(arguments, 1, 0, "(INDICATOR) ->");
      _util.log.apply(window, arguments);
    }
  }
}

export default Indicator;
