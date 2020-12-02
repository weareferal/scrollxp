# Scene Listeners

Listeners can only be added in JavaScript using the `ScrollXP.Scene` builder class.

## `onEnter` listener

Call a function on start the scene.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let customScene = new ScrollXP.Scene("custom-scene")
  .onEnter((element: HTMLElement, scene: IScene, vars?: SceneEventVars) => {
    // Do something when entering
  })
  .build()

view.register(customScene)
```

## `onLeave` listener

Call a function on end the scene.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let customScene = new ScrollXP.Scene("custom-scene")
  .onLeave((element: HTMLElement, scene: IScene, vars?: SceneEventVars) => {
    // Do something when leaving
  })
  .build()

view.register(customScene)
```

## `onProgress` listener

Call a function during the scene.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let customScene = new ScrollXP.Scene("custom-scene")
  .onProgress((element: HTMLElement, scene: IScene, vars?: SceneEventVars) => {
    // Do something when running
  })
  .build()

view.register(customScene)
```
