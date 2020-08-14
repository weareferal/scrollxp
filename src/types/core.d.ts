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

interface IBuilder<D extends Descriptor> {
  build(): D
}

interface IParser<D extends Descriptor> {
  parse(target: HTMLElement, container?: HTMLElement): D
  getElements(target: HTMLElement): HTMLElement[]
}
