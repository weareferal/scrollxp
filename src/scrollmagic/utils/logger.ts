const logLevels = ["error", "warn", "info", "log"]
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
  error(...args: any[]): void {
    this.log(1, ...args)
  },
  warning(...args: any[]): void {
    this.log(2, ...args)
  },
  info(...args: any[]): void {
    this.log(3, ...args)
  },
  verbose(...args: any[]): void {
    this.log(4, ...args)
  },
  log(...args: any[]): void {
    let logLevel = args[0]

    if (logLevel > logLevels.length || logLevel <= 0) {
      logLevel = logLevels.length
    }

    const now = new Date()

    const time =
      "[" +
      ("0" + now.getHours()).slice(-2) +
      "h" +
      ("0" + now.getMinutes()).slice(-2) +
      "m" +
      ("0" + now.getSeconds()).slice(-2) +
      "s" +
      ("00" + now.getMilliseconds()).slice(-3) +
      "ms]"

    const method = logLevels[logLevel - 1]

    const newArgs = Array.prototype.splice.call(args, 1)

    const func = Function.prototype.bind.call(console[method], console)

    newArgs.unshift(time)

    func.apply(console, newArgs)
  },
}
