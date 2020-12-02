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
