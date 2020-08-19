import { Descriptor } from "./descriptors"
import { ParamString } from "./params"

export interface IBuilder<D extends Descriptor> {
  build(): D
}

export interface IParser<D extends Descriptor> {
  parse(target: HTMLElement, container?: HTMLElement): D
  getName(target: HTMLElement): ParamString
  getElements(target: HTMLElement): HTMLElement[]
}
