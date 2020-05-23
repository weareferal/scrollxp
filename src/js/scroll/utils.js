/**
 * BreakpointListener
 * 
 * Provide information when screen size changes from/to several breakpoints.
 * 
 * @param {function} callback
 * @param {json} breakpoints
 */
export class BreakpointListener {
  constructor(callback, breakpoints) {
    this.screenSize = null;
    this.windowWidth = window.innerWidth;
    this.timeout = null;

    this.checkView = () => {
      let keys = Object.keys(breakpoints);

      let screenSize = keys.slice(-1)[0];

      for (let i=keys.length-1; i >= 0; i--) {
        let value = breakpoints[keys[i]];
        if (this.windowWidth < value) {
          screenSize = keys[i-1] || 'xs';
        }
      }

      let hasChanged = this.screenSize !== screenSize;

      this.screenSize = screenSize;

      callback({
        screenSize: this.screenSize,
        hasChanged: hasChanged
      });
    };

    this.listener = () => {
      if (this.windowWidth !== window.innerWidth) {
        this.windowWidth = window.innerWidth;
    
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
    
        this.timeout = setTimeout(this.checkView, 250);
      }
    };
  
    window.addEventListener('resize', this.listener);

    this.checkView();
  }
};

/**
 * PropertyHelper
 * 
 * Retrieve property values from data-* attributes according to the screen width.
 * 
 * @param {json} breakpoints
 */
export class PropertyHelper {
  constructor(breakpoints) {
    this._breakpoints = breakpoints ? breakpoints : {
      'sm': 576,
      'md': 768,
      'lg': 992,
      'xl': 1200,
      'xxl': 1600
    };
  }

  breakpoints(newValue) {
    if (!arguments.length) {
      return this._breakpoints;
    } else {
      this._breakpoints = newValue;
    }
  }

  // TODO: Improve this to be independent from breakpoints, maybe using a recursive function
  getDataProperty(type, item, property, defaultValue) {
    const screenWidth = window.innerWidth;

    const key = property === type ? type : `${type}-${property}`;

    // xs
    if (screenWidth < this._breakpoints['sm']) {
      return item.getAttribute(`data-xs-${key}`) ||
            item.getAttribute(`data-${key}`) ||
            defaultValue;
    }
    // sm
    else if (screenWidth < this._breakpoints['md']) {
      return item.getAttribute(`data-sm-${key}`) ||
            item.getAttribute(`data-xs-${key}`) ||
            item.getAttribute(`data-${key}`) ||
            defaultValue;
    }
    // md
    else if (screenWidth < this._breakpoints['lg']) {
      return item.getAttribute(`data-md-${key}`) ||
            item.getAttribute(`data-sm-${key}`) ||
            item.getAttribute(`data-xs-${key}`) ||
            item.getAttribute(`data-${key}`) ||
            defaultValue;
    }
    // lg
    else if (screenWidth < this._breakpoints['xl']) {
      return item.getAttribute(`data-lg-${key}`) ||
            item.getAttribute(`data-md-${key}`) ||
            item.getAttribute(`data-sm-${key}`) ||
            item.getAttribute(`data-xs-${key}`) ||
            item.getAttribute(`data-${key}`) ||
            defaultValue;
    }
    // xl
    else if (screenWidth < this._breakpoints['xxl']) {
      return item.getAttribute(`data-xl-${key}`) ||
            item.getAttribute(`data-lg-${key}`) ||
            item.getAttribute(`data-md-${key}`) ||
            item.getAttribute(`data-sm-${key}`) ||
            item.getAttribute(`data-xs-${key}`) ||
            item.getAttribute(`data-${key}`) ||
            defaultValue;
    }
    // xxl
    else {
      return item.getAttribute(`data-xxl-${key}`) ||
            item.getAttribute(`data-xl-${key}`) ||
            item.getAttribute(`data-lg-${key}`) ||
            item.getAttribute(`data-md-${key}`) ||
            item.getAttribute(`data-sm-${key}`) ||
            item.getAttribute(`data-xs-${key}`) ||
            item.getAttribute(`data-${key}`) ||
            defaultValue;
    }
  };

  getParallaxProperty(item, property, defaultValue) {
    return this.getDataProperty('parallax', item, property, defaultValue);
  }

  getSceneProperty(item, property, defaultValue) {
    return this.getDataProperty('scene', item, property, defaultValue);
  }

  getAnimationProperty(item, property, defaultValue) {
    return this.getDataProperty('animate', item, property, defaultValue);
  }
};

/**
 * Class Watcher
 * 
 * Wait for class before running callback.
 * 
 * @param {node} domElement
 * @param {string} className
 * @param {function} callback
 */
export class ClassWatcher {
  constructor(domElement, className, callback) {
    if (domElement.classList.contains(className)) {
      callback();
    } else {
      const observer = new MutationObserver(mutationsList => {
        for(let mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (mutation.target.classList.contains(className)) {
              callback();

              observer.disconnect();
            }
            break;
          }
        }
      });
      observer.observe(domElement, { attributes: true });
    }
  }
};

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

/**
 * Deep merge two objects.
 * @param {json} target
 * @param {json} sources
 * @returns {json}
 */
export function mergeDeep(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};
