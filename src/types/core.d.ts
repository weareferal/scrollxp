interface IBuilder<D extends Descriptor> {
  build(): D
}

interface IParser<D extends Descriptor> {
  parse(target: HTMLElement, container?: HTMLElement): D
  getElements(target: HTMLElement): HTMLElement[]
}
