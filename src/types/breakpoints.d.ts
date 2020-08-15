interface Breakpoints {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}

interface BreakpointListenerResult {
  screenSize: string
  hasChanged: boolean
}
