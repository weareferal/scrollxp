import App from "./app"

import Menu from "./components/menu"
import ScrollContainer from "./components/scroll-container"
import ToggleButton from "./components/toggle-button"

(() => {
  App.init([
    Menu,
    ScrollContainer,
    ToggleButton
  ])
})()
