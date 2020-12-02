# Animation

An animation is a transition from a set of CSS properties to another set of CSS properties.

It can only run inside of a [scene](../scene/README.md).

> **Note:** Animations run sequentially according to their declaration in the HTML.

## Declaration

There are two ways to declare animations, it can be an **annonymous** or a **named** animation.

### Anonymous Animation

To declare an anonymous animation, add the attribute `data-animate` to your HTML element:

```html
<div data-scene>
  <div data-animate></div>
</div>
```

### Named Animation

To declare a named animation, add the attribute `data-animate` with the name of the animation to your HTML element:

```html
<div data-scene>
  <div data-animate="fade-in"></div>
</div>
```

Named animations allow you to avoid repetition by setting up the animation properties only once in the JavaScript.

This way you can reuse the same animation configuration throughout your project.

## Properties

There are two different types of properties you can set to animations: **state properties** and **control properties**.

### State Properties

These are properties that change the animation **look**.

- Alpha (Opacity)
- X Position
- Y Position
- X Percent Position
- Y Percent Position
- Scale
- Rotation
- Rotation X
- Rotation Y
- Skew X
- Skew Y
- Width
- Height

### Control Properties

These are properties that change the animation **behavior**.

- Delay
- Label
- Position
- Ease
- Repeat
- Yoyo
- Transform Origin
- Duration
- Stagger

## Properties Attribution

There are 4 ways to set animation properties:

- [Default Properties](#default-properties)
- [Registered Properties](#registered-properties)
- [Attribute Properties](#attribute-properties)
- [Mixed Properties](#mixed-properties)

### Default Properties

It changes all the animations inside a container at once.

You can do that by defining a set of properties using the exposed `ScrollXP.Animation` builder class.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

view.setDefault(new ScrollXP.Animation().duration(0.3).build())
```

In the above example, all the scenes inside the `body` will have the same duration of 300ms.

### Registered Properties

It creates a named animation that you can refer to in the HTML.

You can do that by defining a set of properties using the exposed `ScrollXP.Animation` builder class and naming that scene.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let fadeInAnimation = new ScrollXP.Animation("fade-in").fromAlpha(0).toAlpha(1).build()

view.register(fadeInAnimation)
```

Then you can refer to it in the HTML:

```html
<div data-scene>
  <div data-animate="fade-in"></div>
</div>
```

In the above example, the `<div>` will animate from opacity `0` to opacity `1`.

### Attribute Properties

It changes the properties for a specific animation.

You can do that by adding `data-animate-[property-name]` to the HTML element of the animation.

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-x="0" data-animate-to-x="200"></div>
</div>
```

In the above example, the `<div>` will animate from its initial position to 200px to the right.

### Mixed Properties

The previous properties can be combined or overridden by following the priorities sequence below:

> **Default** properties < **Registered** properties < **Attribute** properties

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let defaultAnimation = new ScrollXP.Animation().duration(1).build()

view.setDefault(defaultAnimation)

let fadeInAnimation = new ScrollXP.Animation("fade-in").fromAlpha(0).toAlpha(1).build()

view.register(fadeInAnimation)
```

Then you can refer to it in the HTML:

```html
<div data-scene>
  <!-- Animation 1 -->
  <div data-animate="fade-in"></div>
  <!-- Animation 2 -->
  <div data-animate="fade-in" data-animate-from-alpha="0.5" data-animate-from-y="20"></div>
</div>
```

In the above example, the animations will have the following properties.

**Animation 1:**

- `duration`: 1
- `fromAlpha`: 0
- `toAlpha`: 1

**Animation 2:**

- `duration`: 1
- `fromAlpha`: 0.5
- `toAlpha`: 1
- `fromY`: 20

See full [documentation](animation-properties.md).
