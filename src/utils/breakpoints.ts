export interface Breakpoints {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}

export interface BreakpointListenerResult {
  screenSize: string
  hasChanged: boolean
}

/**
 * BreakpointListener
 *
 * Provide information when screen size changes from/to several breakpoints.
 *
 * @param {() => void} callback
 * @param {Breakpoints} breakpoints
 */
export class BreakpointListener {
  private screenSize: string
  private windowWidth: number = window.innerWidth
  private timeout: number
  private checkView: () => void
  private listener: () => void

  constructor(callback: (BreakpointListenerResult) => void, breakpoints: Breakpoints) {
    this.checkView = () => {
      const keys = Object.keys(breakpoints)

      let screenSize = keys.slice(-1)[0]

      for (let i = keys.length - 1; i >= 0; i--) {
        const value = breakpoints[keys[i]]
        if (this.windowWidth < value) {
          screenSize = keys[i - 1] || "xs"
        }
      }

      const hasChanged = this.screenSize !== screenSize

      this.screenSize = screenSize

      callback({
        screenSize: this.screenSize,
        hasChanged: hasChanged,
      })
    }

    this.listener = () => {
      if (this.windowWidth !== window.innerWidth) {
        this.windowWidth = window.innerWidth

        if (this.timeout) {
          window.clearTimeout(this.timeout)
        }

        this.timeout = window.setTimeout(this.checkView, 250)
      }
    }

    window.addEventListener("resize", this.listener)

    this.checkView()
  }
}
