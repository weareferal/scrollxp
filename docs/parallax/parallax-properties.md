# Parallax Properties

## Type

Sets the type of the parallax effect.

| Property             | Builder Method | Type     | Default Value |
| -------------------- | -------------- | -------- | ------------- |
| `data-parallax-type` | `.type()`      | `string` | `global`      |

Accepted values:

- `global`: The HTML element will move throughout the whole container extension.
- `scene`: The HTML element will move as long as the duration of the scene.

**Example:**

```html
<div data-parallax data-parallax-type="global"></div>
```

In the above example, the `<div>` will move throughout the whole container extension.

## Speed

Sets the speed ratio.

| Property              | Builder Method | Type     | Default Value |
| --------------------- | -------------- | -------- | ------------- |
| `data-parallax-speed` | `.speed()`     | `number` | `1`           |

When scrolling, the HTML element will move 1/`speed` times the original distance, i.e. the further from zero, the slower it moves.

Negative values make the element move to the scroll **opposite direction**.

**Example 1:**

```html
<div data-parallax data-parallax-speed="2"></div>
```

In the above example, when scrolling down 100px, the `<div>` will move 1/2 of the same distance to the same direction, i.e., 50px downwards.

**Example 2:**

```html
<div data-parallax data-parallax-speed="-2"></div>
```

In the above example, when scrolling down 100px, the `<div>` will move 1/2 of the same distance to the opposite direction, i.e., 50px upwards.

## Momentum

Sets the time in seconds that the animation will continue running after you stop scrolling.

| Property                 | Builder Method | Type     | Default Value |
| ------------------------ | -------------- | -------- | ------------- |
| `data-parallax-momentum` | `.momentum()`  | `number` | `0.3`         |

It's used to make the animation smooth and natural.

```html
<div data-parallax data-parallax-momentum="2"></div>
```

In the above example, the `<div>` will continue moving for 2 seconds after the scroll stops.

## Ease

Sets the timing of the animation.

| Property             | Builder Method | Type     | Default |
| -------------------- | -------------- | -------- | ------- |
| `data-parallax-ease` | `.ease()`      | `string` | `none`  |

Accepted values:

- `none`
- `power1.out`
- `power1.in`
- `power1.inOut`
- `power2.out`
- `power2.in`
- `power2.inOut`
- `power3.out`
- `power3.in`
- `power3.inOut`
- `power4.out`
- `power4.in`
- `power4.inOut`
- `back.out`
- `back.in`
- `back.inOut`
- `elastic.out`
- `elastic.in`
- `elastic.inOut`
- `bounce.out`
- `bounce.in`
- `bounce.inOut`
- `rough`
- `slow`
- `steps`
- `circ.out`
- `circ.in`
- `circ.inOut`
- `expo.out`
- `expo.in`
- `expo.inOut`
- `sine.out`
- `sine.in`
- `sine.inOut`

See how each one of them behave [here](https://greensock.com/docs/v3/Eases).

**Example:**

```html
<div data-parallax data-parallax-ease="power4.out"></div>
```

In the above example, the `<div>` will smoothly animate until it stops.

## Stagger

It's used to create a sequential animation with the **HTML element children**.

Sets the time in seconds that separates each animation.

> **Note:** When adding this property, all the other properties will use the HTML element children instead of itself.

| Property                | Builder Method | Type     |
| ----------------------- | -------------- | -------- |
| `data-parallax-stagger` | `.stagger()`   | `number` |

**Example:**

```html
<div data-parallax data-parallax-stagger="0.2">
  <span></span>
  <span></span>
  <span></span>
</div>
```

In the above example, the `<span>`s will move sequentially when scrolling, and each element will start moving with an interval of 200ms between them.

## Enabled

Sets whether the parallax is enabled or not.

It's used with breakpoints to enable/disable parallax for different screen resolutions.

| Property                | Builder Method | Type      | Default Value |
| ----------------------- | -------------- | --------- | ------------- |
| `data-parallax-enabled` | `.enabled()`   | `boolean` | `true`        |

**Example:**

```html
<div data-parallax data-parallax-enabled="false"></div>
```

In the above example, no effect is applied to the HTML element.

## Trigger Element

Sets the HTML element that will trigger the parallax.

| Property                | Builder Method | Type     | Default Value                         |
| ----------------------- | -------------- | -------- | ------------------------------------- |
| `data-parallax-trigger` | `.trigger()`   | `string` | The HTML element with `data-parallax` |

It accepts a selector as value. Ex: `.wrapper`, `#home`, `section > div`, etc.

**Example:**

```html
<h1 id="my-title">My Title</h1>
<div data-parallax data-parallax-type="scene" data-parallax-trigger="#my-title"></div>
```

In the above example, instead of starting at the element where it's declared, the parallax will start at the `<h1>` element.

## Hook

Sets at which point in the viewport the parallax will be triggered.

| Property             | Builder Method | Type                 | Default Value |
| -------------------- | -------------- | -------------------- | ------------- |
| `data-parallax-hook` | `.hook()`      | `string` or `number` | `onCenter`    |

It accepts two types of values:

1. `string`: There are 3 possible strings.

   - `onEnter`: The parallax will be triggered as soon as the trigger element enters the viewport.
   - `onLeave`: The parallax will be triggered as soon as the trigger element leaves the viewport.
   - `onCenter`: The parallax will be triggered as soon as the trigger element reaches the center of the viewport.

2. `number`: A float number between 0-1.

   It represents the percentage of the screen that triggers the parallax:

   - `0` is the same than `onLeave`
   - `0.5` is the same than `onCenter`
   - `1` is the same than `onEnter`

**Example:**

```html
<div data-parallax data-parallax-type="scene" data-parallax-hook="onEnter"></div>
```

In the above example, as soon as the element enters the viewport, the parallax will be triggered.

## Duration

Sets the duration of the parallax effect.

| Property                 | Builder Method | Type                 | Default Value |
| ------------------------ | -------------- | -------------------- | ------------- |
| `data-parallax-duration` | `.duration()`  | `number` or `string` | `100%`        |

It accepts two types of values:

1. `number`: Sets the duration of the parallax to exactly this amount of pixels.

   This means the parallax will last for exactly this amount of pixels scrolled.

   A value of `0` means that the parallax is "open end" and no end will be triggered.

2. `string`: Always updates the duration relative to the screen viewport height.

   For example, "100%" will keep the duration the same than the viewport height.

**Example:**

```html
<div data-parallax data-parallax-type="scene" data-parallax-duration="200"></div>
```

In the above example, the parallax will work for the next 200px once triggered.

## Offset

Sets an offset in pixels to start the parallax based on the HTML element.

| Property               | Builder Method | Type     | Default Value |
| ---------------------- | -------------- | -------- | ------------- |
| `data-parallax-offset` | `.offset()`    | `number` | `0`           |

**Example:**

```html
<div data-parallax data-parallax-type="scene" data-parallax-offset="300"></div>
```

In the above example, the parallax will start at 300px below the `<div>` position.

## Indicator

Sets the indicators name for the parallax.

When it's not empty, some elements will appear on the screen to indicate where the scene starts and ends.

It's used for debug.

| Property                  | Builder Method | Type     | Default Value |
| ------------------------- | -------------- | -------- | ------------- |
| `data-parallax-indicator` | `.indicator()` | `string` | Empty         |

**Example:**

```html
<div data-parallax data-parallax-type="scene" data-parallax-indicator="my-parallax"></div>
```

In the above example, an indicator with the text "trigger", an indicator with the text "start my-parallax" and an indicator with the text "end my-parallax" will be added to the screen.
