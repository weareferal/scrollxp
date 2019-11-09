import { component } from '../decorators';
import { findComponent } from '../utils';
import ScrollController from './scroll-controller';


@component('menu')
class Menu {
  constructor(element) {
    const scrollController = findComponent(ScrollController);
    if (scrollController) {
      const anchors = element.querySelectorAll('a[href^="#"]');
      scrollController.bindAnchors(anchors);
    }
  }
};

export default Menu;
