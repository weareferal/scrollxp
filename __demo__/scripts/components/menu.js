import { component } from '../decorators';
import { findComponent } from '../utils';
import ScrollContainer from './scroll-container';


@component('menu')
class Menu {
  constructor(element) {
    const scrollContainer = findComponent(ScrollContainer);
    if (scrollContainer) {
      const anchors = element.querySelectorAll('a[href^="#"]');
      scrollContainer.bindAnchors(anchors);
    }
  }
};

export default Menu;
