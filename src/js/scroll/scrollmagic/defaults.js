import { _util } from './util';

export const CONTROLLER_OPTIONS = {
  defaults: {
    container: window,
    vertical: true,
    globalSceneOptions: {},
    loglevel: 2,
    refreshInterval: 100,
    addIndicators: false
  }
};

export const SCENE_OPTIONS = {
  defaults: {
    duration: 0,
    offset: 0,
    triggerElement: undefined,
    triggerHook: 0.5,
    reverse: true,
    loglevel: 2,
    tweenChanges: false
  },
  validate: {
    offset: function (val) {
      val = parseFloat(val);
      if (!_util.type.Number(val)) {
        throw ["Invalid value for option \"offset\":", val];
      }
      return val;
    },
    triggerElement: function (val) {
      val = val || undefined;
      if (val) {
        var elem = _util.get.elements(val)[0];
        if (elem && elem.parentNode) {
          val = elem;
        } else {
          throw ["Element defined in option \"triggerElement\" was not found:", val];
        }
      }
      return val;
    },
    triggerHook: function (val) {
      var translate = {
        "onCenter": 0.5,
        "onEnter": 1,
        "onLeave": 0
      };
      if (_util.type.Number(val)) {
        val = Math.max(0, Math.min(parseFloat(val), 1)); //  make sure its betweeen 0 and 1
      } else if (val in translate) {
        val = translate[val];
      } else {
        throw ["Invalid value for option \"triggerHook\": ", val];
      }
      return val;
    },
    reverse: function (val) {
      return !!val; // force boolean
    },
    loglevel: function (val) {
      val = parseInt(val);
      if (!_util.type.Number(val) || val < 0 || val > 3) {
        throw ["Invalid value for option \"loglevel\":", val];
      }
      return val;
    },
    tweenChanges: function (val) {
      return !!val;
    }
  }, // holder for  validation methods. duration validation is handled in 'getters-setters.js'
  shifts: ["duration", "offset", "triggerHook"], // list of options that trigger a `shift` event
};
