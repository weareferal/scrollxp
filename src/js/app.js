import { getData, setData } from './utils';

import Menu from './components/menu';
import ScrollController from './components/scroll-controller';
import ToggleButton from './components/toggle-button';


let App = {
  components: [
    Menu,
    ScrollController,
    ToggleButton
  ]
};

(() => {
  // Bind components
  document.querySelectorAll('[data-component]').forEach(el => {
    let names = el.getAttribute('data-component').split(',');
    names.forEach(name => {
      let component = App.components.find(c => c.componentName === name);
      if (!component) {
        console.error(`[App] Component "${name}" is not defined`);
        return false;
      } else {
        let existing = getData(el) && getData(el).loadedComponents;
        if (!existing) {
          existing = [];
          setData(el, { loadedComponents: existing })
        }
        if (!(name in getData(el).loadedComponents)) {
          let options;
          try {
            options = eval('(' + el.getAttribute('data-component-options') + ')') || {};
          } catch (ex) {
            options = {};
          }
          let Constructor = component;
          let obj = new Constructor(el, options);
          existing.push(name);
          setData(el, { component: obj })
          console.debug(`[App] Component "${name}" loaded.`);
        } else {
          console.debug(`[App] Component "${name}" already loaded`);
        }
      }
    });
  });
})();
