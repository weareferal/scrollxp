import { getData, setData } from './utils'

import Menu from './components/menu'
import ScrollContainer from './components/scroll-container';
import ToggleButton from './components/toggle-button';


let App = {
  components: [
    Menu,
    ScrollContainer,
    ToggleButton
  ]
};

(() => {
  // Bind components
  document.querySelectorAll('[data-component]').forEach((el) => {
    let names = el.getAttribute('data-component')?.split(',')
    if (names && names.length > 0) {
      names.forEach((name) => {
        let component = App.components.find(c => c.componentName === name)
        if (!component) {
          throw Error(`[App] Component "${name}" is not defined`)
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
            let obj = new Constructor(el, options)
            existing.push(name);
            setData(el, { component: obj })
            console.debug(`[App] Component "${name}" loaded.`);
          } else {
            console.debug(`[App] Component "${name}" already loaded`);
          }
        }
      });
    }
  });
})();
