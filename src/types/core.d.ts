interface IBuilder<D extends Descriptor> {
  build(): D
}

interface IParser<D extends Descriptor> {
  parse(target: HTMLElement, container?: HTMLElement): D
  getName(target: HTMLElement): ParamString
  getElements(target: HTMLElement): HTMLElement[]
}
