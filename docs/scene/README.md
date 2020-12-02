# Scene

A scene defines a scope for the animations, and they can only work inside of it.

## Declaration

There are two ways to declare scenes, it can be an **annonymous** or a **named** scene.

### Anonymous Scene

To declare an anonymous scene, add the attribute `data-scene` to your HTML element:

```html
<div data-scene></div>
```

### Named Scene

To declare a named scene, add the attribute `data-scene` with the name of the scene to your HTML element:

```html
<div data-scene="my-scene"></div>
```

Named scenes allow you to avoid repetition by setting up the scene properties only once in the JavaScript.

This way you can reuse the same scene configuration throughout your project.

## Properties

There are some properties you can change on a scene. They are:

- [Trigger Element](scene-properties.md#trigger-element)
- [Hook](scene-properties.md#hook)
- [Duration](scene-properties.md#duration)
- [Reverse](scene-properties.md#reverse)
- [Enabled](scene-properties.md#enabled)
- [Indicator](scene-properties.md#indicator)
- [Class Toggle](scene-properties.md#class-toggle)
- [Pin](scene-properties.md#pin)

And there are 4 ways to set scene properties:

- [Default Properties](#default-properties)
- [Registered Properties](#registered-properties)
- [Attribute Properties](#attribute-properties)
- [Mixed Properties](#mixed-properties)

### Default Properties

It changes all the scenes inside a container at once.

You can do that by defining a set of properties using the exposed `ScrollXP.Scene` builder class.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

view.setDefault(new ScrollXP.Scene().duration(200).build())
```

In the above example, all the scenes inside the `body` will have the same duration of 200px.

### Registered Properties

It creates a named scene that you can refer to in the HTML.

You can do that by defining a set of properties using the exposed `ScrollXP.Scene` builder class and naming that scene.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let fullScene = new ScrollXP.Scene("full-scene").hook("onEnter").duration(500).build()

view.register(fullScene)
```

Then you can refer to it in the HTML:

```html
<div data-scene="full-scene"></div>
```

In the above example, the scene will be triggered as soon as the HTML element enters the viewport and have the duration of 500px after it starts.

### Attribute Properties

It changes the scene properties for a specific scene.

You can do that by adding `data-scene-[property-name]` to the HTML element of the scene.

**Example:**

```html
<div data-scene data-scene-duration="300"></div>
```

In the above example, the scene will have a duration of 300px after it starts.

### Mixed Properties

The previous properties can be combined or overridden by following the priorities sequence below:

> **Default** properties < **Registered** properties < **Attribute** properties

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let defaultScene = new ScrollXP.Scene().hook("onEnter").build()

view.setDefault(defaultScene)

let fullScene = new ScrollXP.Scene("full-scene").duration(500).build()

view.register(fullScene)
```

Then you can refer to it in the HTML:

```html
<!-- Scene 1 -->
<div data-scene="full-scene"></div>
<!-- Scene 2 -->
<div data-scene="full-scene" data-scene-duration="250" data-scene-reverse="false"></div>
```

In the above example, the scenes will have the following properties.

**Scene 1:**

- `hook`: "onEnter""
- `duration`: 500

**Scene 2:**

- `hook`: "onEnter"
- `duration`: 250
- `reverse`: false

See full [documentation](scene-properties.md).

## Listeners

At the moment, there are 3 different listeners you can add to a scene:

- [`onEnter` listener](scene-listeners.md#onenter-listener)
- [`onLeave` listener](scene-listeners.md#onleave-listener)
- [`onProgress` listener](scene-listeners.md#onprogress-listener)

See full [documentation](scene-listeners.md).
