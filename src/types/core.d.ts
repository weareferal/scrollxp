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

interface Descriptor {
  name?: string
}

interface AnimationDescriptor extends Descriptor {
  duration: number
  repeat: number
  yoyo: boolean
  transformOrigin: string
  from: StateProperty
  to: StateProperty
  delay: number
  ease: string
  momentum: number
  position: string
  stagger?: number
  label?: string
}

interface StateProperty {
  alpha?: number
  x?: number
  y?: number
  xPercent?: number
  yPercent?: number
  scale?: number
  rotation?: number
  width?: number
}

interface IBuilder<D extends IDescriptor> {
  build(): D
}

interface IParser<D extends IDescriptor> {
  parse(target: HTMLElement): D
  getElements(target: HTMLElement): HTMLElement[]
}
