# Animation Properties

## Alpha (Opacity)

Sets the HTML element opacity.

Value must be between 0-1.

| Property                  | Builder Method | Type     |
| ------------------------- | -------------- | -------- |
| `data-animate-from-alpha` | `.fromAlpha()` | `number` |
| `data-animate-to-alpha`   | `.toAlpha()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-alpha="0" data-animate-to-alpha="1"></div>
</div>
```

In the above example, the `<div>` will animate from opacity `0` to opacity `1`.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## X Position

Sets the HTML element horizontal position.

Value is set in `px`.

| Property              | Builder Method | Type     |
| --------------------- | -------------- | -------- |
| `data-animate-from-x` | `.fromX()`     | `number` |
| `data-animate-to-x`   | `.toX()`       | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-x="-50" data-animate-to-x="100"></div>
</div>
```

In the above example, the `<div>` will animate from -50px left to 100px right of its initial position.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Y Position

Sets the HTML element vertical position.

Value is set in `px`.

| Property              | Builder Method | Type     |
| --------------------- | -------------- | -------- |
| `data-animate-from-y` | `.fromY()`     | `number` |
| `data-animate-to-y`   | `.toY()`       | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-y="-50" data-animate-to-y="100"></div>
</div>
```

In the above example, the `<div>` will animate from -50px top to 100px bottom of its initial position.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## X Percent Position

Sets the HTML element horizontal position.

Value is set in `%`.

| Property                      | Builder Method    | Type     |
| ----------------------------- | ----------------- | -------- |
| `data-animate-from-x-percent` | `.fromXPercent()` | `number` |
| `data-animate-to-x-percent`   | `.toXPercent()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-x-percent="-10" data-animate-to-x-percent="100"></div>
</div>
```

In the above example, the `<div>` will animate from -10% left to 100% right of its initial position.

The percentage is related to the element **width**.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Y Percent Position

Sets the HTML element vertical position.

Value is set in `%`.

| Property                      | Builder Method    | Type     |
| ----------------------------- | ----------------- | -------- |
| `data-animate-from-y-percent` | `.fromYPercent()` | `number` |
| `data-animate-to-y-percent`   | `.toYPercent()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-y-percent="-10" data-animate-to-y-percent="100"></div>
</div>
```

In the above example, the `<div>` will animate from -10% top to 100% bottom of its initial position.

The percentage is related to the element **height**.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Scale

Sets the HTML element scale.

| Property                  | Builder Method | Type     |
| ------------------------- | -------------- | -------- |
| `data-animate-from-scale` | `.fromScale()` | `number` |
| `data-animate-to-scale`   | `.toScale()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-scale="0.5" data-animate-to-scale="2"></div>
</div>
```

In the above example, the `<div>` will animate from 1/2 to 2x its initial size.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Rotation

Sets the HTML element rotation.

Value is set in `deg`.

| Property                     | Builder Method    | Type     |
| ---------------------------- | ----------------- | -------- |
| `data-animate-from-rotation` | `.fromRotation()` | `number` |
| `data-animate-to-rotation`   | `.toRotation()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-rotation="-90" data-animate-to-rotation="90"></div>
</div>
```

In the above example, the `<div>` will animate from -90deg to 90deg considering its initial position.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Rotation X

Sets the HTML element rotation around the horizontal axis.

Value is set in `deg`.

| Property                       | Builder Method     | Type     |
| ------------------------------ | ------------------ | -------- |
| `data-animate-from-rotation-x` | `.fromRotationX()` | `number` |
| `data-animate-to-rotation-x`   | `.toRotationX()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-rotation-x="-45" data-animate-to-rotation-x="45"></div>
</div>
```

In the above example, the `<div>` will animate from -45deg to 45deg around the horizontal axis.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Rotation Y

Sets the HTML element rotation around the vertical axis.

Value is set in `deg`.

| Property                       | Builder Method     | Type     |
| ------------------------------ | ------------------ | -------- |
| `data-animate-from-rotation-y` | `.fromRotationY()` | `number` |
| `data-animate-to-rotation-y`   | `.toRotationY()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-rotation-y="-45" data-animate-to-rotation-y="45"></div>
</div>
```

In the above example, the `<div>` will animate from -45deg to 45deg around the vertical axis.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Skew X

Sets a transformation that skews the HTML element in the horizontal direction.

Value is set in `deg`.

| Property                   | Builder Method | Type     |
| -------------------------- | -------------- | -------- |
| `data-animate-from-skew-x` | `.fromSkewX()` | `number` |
| `data-animate-to-skew-x`   | `.toSkewX()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-skew-x="-45" data-animate-to-skew-x="45"></div>
</div>
```

In the above example, the `<div>` will animate from -45deg to 45deg in the horizontal direction.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Skew Y

Sets a transformation that skews the HTML element in the vertical direction.

Value is set in `deg`.

| Property                   | Builder Method | Type     |
| -------------------------- | -------------- | -------- |
| `data-animate-from-skew-y` | `.fromSkewY()` | `number` |
| `data-animate-to-skew-y`   | `.toSkewY()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-skew-y="-45" data-animate-to-skew-y="45"></div>
</div>
```

In the above example, the `<div>` will animate from -45deg to 45deg in the vertical direction.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Width

Sets the HTML element width.

Value is set in `px`.

| Property                  | Builder Method | Type     |
| ------------------------- | -------------- | -------- |
| `data-animate-from-width` | `.fromWidth()` | `number` |
| `data-animate-to-width`   | `.toWidth()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-width="100" data-animate-to-width="200"></div>
</div>
```

In the above example, the `<div>` width will animate from 100px to 200px.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Height

Sets the HTML element height.

Value is set in `px`.

| Property                   | Builder Method  | Type     |
| -------------------------- | --------------- | -------- |
| `data-animate-from-height` | `.fromHeight()` | `number` |
| `data-animate-to-height`   | `.toHeight()`   | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-height="100" data-animate-to-height="200"></div>
</div>
```

In the above example, the `<div>` height will animate from 100px to 200px.

> **Note:** When `from` or `to` are omitted, the CSS value for the property is used in its place.

## Delay

Sets a time that will delay the animation to start.

Value is set in **seconds**.

| Property             | Builder Method | Type     |
| -------------------- | -------------- | -------- |
| `data-animate-delay` | `.delay()`     | `number` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-delay="3"></div>
</div>
```

In the above example, the `<div>` will start animating after 3 seconds.

## Label

Creates a mark in the scene to be refered by other animations when using the property [position](#position).

| Property             | Builder Method | Type     |
| -------------------- | -------------- | -------- |
| `data-animate-label` | `.label()`     | `string` |

**Example:**

```html
<div data-scene>
  <div data-animate data-animate-from-alpha="0" data-animate-to-alpha="1" data-animate-label="afterFadeIn"></div>
</div>
```

In the above example, the animation sequence will be marked with the string `"afterFadeIn"` when the animation is finished.

Check the next property for a better understanding.

## Position

Sets the position in the scene where the animation should begin.

It can refer to a [label](#label) or its own position in time.

It's used to run animations asynchronously.

| Property                | Builder Method | Type     |
| ----------------------- | -------------- | -------- |
| `data-animate-position` | `.position()`  | `string` |

Accepted value formats:

- `label`: a label previously defined
- `label+=[seconds]`: a label previously defined plus some time in seconds
- `label-=[seconds]`: a label previously defined minus some time in seconds

**Example:**

```html
<div data-scene>
  <!-- Animation 1 -->
  <div data-animate data-animate-from-alpha="0" data-animate-to-alpha="1" data-animate-label="afterFadeIn"></div>
  <!-- Animation 2 -->
  <div data-animate data-animate-from-x="-100"></div>
  <!-- Animation 3 -->
  <div data-animate data-animate-from-y="100" data-animate-position="afterFadeIn"></div>
</div>
```

In the above example, the **Animation 3** will start running at the same time than **Animation 2** because both are positioned after **Animation 1** in the timeline.

> **Note:** By default, all scenes start with the label `start`. So, if you want all the animations run at the same time, just add `data-animate-position="start"` to them.

## Ease

Sets the timing of the animation.

| Property            | Builder Method | Type     |
| ------------------- | -------------- | -------- |
| `data-animate-ease` | `.ease()`      | `string` |

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
<div data-scene>
  <div data-animate data-animate-from-y="100" data-animate-to-y="-100" data-animate-ease="elastic.inOut"></div>
</div>
```

In the above example, the `<div>` will animate from 100px bottom to -100px top behaving like an elastic from the beginning to the end.

## Repeat

## Yoyo

## Transform Origin

## Duration

## Stagger
