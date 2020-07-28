import ScrollView from "./scroll-view"

declare let __SCROLLXP_VERSION__: string

export default class ScrollXP {
  static version = __SCROLLXP_VERSION__

  public static View = ScrollView
}
