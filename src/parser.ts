import { IParser, Descriptor, Breakpoints } from "./interfaces"

export default class Parser {
  public readonly breakpoints: Breakpoints

  constructor(breakpoints?: Breakpoints) {
    this.breakpoints = breakpoints || {
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1600,
    }
  }

  public create<D extends Descriptor>(parser: new (Breakpoints, D?) => IParser<D>, defaultOptions?: D): IParser<D> {
    return new parser(this.breakpoints, defaultOptions)
  }
}
