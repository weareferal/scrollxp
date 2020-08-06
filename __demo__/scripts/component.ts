export default class Component {
  protected element: HTMLElement
  protected options: any

  constructor(element: HTMLElement, options?: any) {
    this.element = element
    this.options = options
  }

}
