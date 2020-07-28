// Implementation of requestAnimationFrame
// based on https://gist.github.com/paulirish/1579671

const vendors = ["ms", "moz", "webkit", "o"]
let lastTime = 0
let _requestAnimationFrame = window.requestAnimationFrame
let _cancelAnimationFrame = window.cancelAnimationFrame

// Try vendor prefixes if the above doesn't work
for (let i = 0; !_requestAnimationFrame && i < vendors.length; ++i) {
  _requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"]
  _cancelAnimationFrame =
    window[vendors[i] + "CancelAnimationFrame"] || window[vendors[i] + "CancelRequestAnimationFrame"]
}

// Fallbacks
if (!_requestAnimationFrame) {
  _requestAnimationFrame = function (callback) {
    const currTime = new Date().getTime(),
      timeToCall = Math.max(0, 16 - (currTime - lastTime)),
      id = window.setTimeout(function () {
        callback(currTime + timeToCall)
      }, timeToCall)
    lastTime = currTime + timeToCall
    return id
  }
}

if (!_cancelAnimationFrame) {
  _cancelAnimationFrame = function (id) {
    window.clearTimeout(id)
  }
}

export default {
  rAF: _requestAnimationFrame.bind(window),
  cAF: _cancelAnimationFrame.bind(window),
}
