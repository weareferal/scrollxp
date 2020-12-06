# Parallax

Parallax is an effect where some elements on the screen move slower or faster than others when scrolling, generating a depth perception.

## Declaration

To declare a parallax, add the attribute `data-parallax` to your HTML element:

```html
<div data-parallax></div>
```

## Properties

These are the general properties you can change:

- [Type](parallax-properties.md#type)
- [Speed](parallax-properties.md#speed)
- [Momentum](parallax-properties.md#momentum)
- [Ease](parallax-properties.md#ease)
- [Stagger](parallax-properties.md#stagger)
- [Enabled](parallax-properties.md#enabled)

These are the properties that become available when the parallax type is `scene`:

- [Trigger Element](parallax-properties.md#trigger-element)
- [Hook](parallax-properties.md#hook)
- [Duration](parallax-properties.md#duration)
- [Offset](parallax-properties.md#offset)
- [Indicator](parallax-properties.md#indicator)

## Properties Attribution

There are 3 ways to set parallax properties:

- [Default Properties](#default-properties)
- [Attribute Properties](#attribute-properties)
- [Mixed Properties](#mixed-properties)

### Default Properties

It changes all the parallax elements inside a container at once.

You can do that by defining a set of properties using the exposed `ScrollXP.Parallax` builder class.

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

view.setDefault(new ScrollXP.Parallax().speed(2).build())
```

In the above example, all the parallax elements inside the `body` will have the same speed ratio of 1/2.

### Attribute Properties

It changes the parallax properties for a specific HTML element.

You can do that by adding `data-parallax-[property-name]` to the HTML element of the parallax.

**Example:**

```html
<div data-parallax data-parallax-momentum="1"></div>
```

In the above example, the parallax animation will continue running for 1 second after the scroll stops.

### Mixed Properties

The previous properties can be combined or overridden by following the priorities sequence below:

> **Default** properties < **Attribute** properties

**Example:**

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let defaultParallax = new ScrollXP.Parallax().speed(3).build()

view.setDefault(defaultParallax)
```

Then you can refer to it in the HTML:

```html
<!-- Parallax 1 -->
<div data-parallax></div>
<!-- Parallax 2 -->
<div data-parallax data-parallax-speed="4" data-parallax-momentum="1"></div>
```

In the above example, the parallaxes will have the following properties.

**Parallax 1:**

- `speed`: 3

**Parallax 2:**

- `speed`: 4
- `momentum`: 1

See full [documentation](parallax-properties.md).
