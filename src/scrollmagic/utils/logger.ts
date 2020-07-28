const logLevels = ["error", "warn", "log"]
const console = window.console || {}

console.log =
  console.log ||
  function () {
    return undefined
  } // No console log, well - do nothing then...

// Make sure methods for all levels exist.
for (let i = 0; i < logLevels.length; i++) {
  const method = logLevels[i]
  if (!console[method]) {
    console[method] = console.log // Prefer .log over nothing
  }
}

export default {
  log(...args: any[]): void {
    let logLevel = args[0]

    if (logLevel > logLevels.length || logLevel <= 0) {
      logLevel = logLevels.length
    }

    const now = new Date()

    const time =
      ("0" + now.getHours()).slice(-2) +
      ":" +
      ("0" + now.getMinutes()).slice(-2) +
      ":" +
      ("0" + now.getSeconds()).slice(-2) +
      ":" +
      ("00" + now.getMilliseconds()).slice(-3)

    const method = logLevels[logLevel - 1]

    const newArgs = Array.prototype.splice.call(args, 1)

    const func = Function.prototype.bind.call(console[method], console)

    newArgs.unshift(time)

    func.apply(console, newArgs)
  },
}
