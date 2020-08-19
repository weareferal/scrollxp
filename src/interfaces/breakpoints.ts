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
