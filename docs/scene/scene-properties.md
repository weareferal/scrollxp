# Scene Properties

## Trigger Element

Sets the HTML element that will trigger the scene.

| Property             | Builder Method | Type     | Default Value                      |
| -------------------- | -------------- | -------- | ---------------------------------- |
| `data-scene-trigger` | `.trigger()`   | `string` | The HTML element with `data-scene` |

It accepts a selector as value. Ex: `.wrapper`, `#home`, `section > div`, etc.

**Example:**

```html
<h1 id="my-title">My Title</h1>
<div data-scene data-scene-trigger="#my-title"></div>
```

In the above example, instead of starting at the element where it's declared, the scene will start at the `<h1>` element.

## Hook

Sets at which point in the viewport the scene will be triggered.

| Property          | Builder Method | Type                 | Default Value |
| ----------------- | -------------- | -------------------- | ------------- |
| `data-scene-hook` | `.hook()`      | `string` or `number` | `onCenter`    |

It accepts two types of values:

1. `string`: There are 3 possible strings.

   - `onEnter`: The scene will be triggered as soon as the trigger element enters the viewport.
   - `onLeave`: The scene will be triggered as soon as the trigger element leaves the viewport.
   - `onCenter`: The scene will be triggered as soon as the trigger element reaches the center of the viewport.

2. `number`: A float number between 0-1.

   It represents the percentage of the screen that triggers the scene:

   - `0` is the same than `onLeave`
   - `0.5` is the same than `onCenter`
   - `1` is the same than `onEnter`

**Example:**

```html
<div data-scene data-scene-hook="onEnter"></div>
```

In the above example, as soon as the element enters the viewport, the scene will be triggered.

## Duration

Sets the duration of the scene.

It means if you set that, the animation will be controlled by the scroll and its duration will be ignored.

| Property              | Builder Method | Type                 | Default Value |
| --------------------- | -------------- | -------------------- | ------------- |
| `data-scene-duration` | `.duration()`  | `number` or `string` | `0`           |

It accepts two types of values:

1. `number`: Sets the duration of the scene to exactly this amount of pixels.

   This means the scene will last for exactly this amount of pixels scrolled.

   A value of `0` means that the scene is "open end" and no end will be triggered. Pins will never unpin and animations will play independently of scroll progress.

2. `string`: Always updates the duration relative to parent scroll container.

   For example, "100%" will keep the duration always exactly at the inner height of the scroll container.

**Example:**

```html
<div data-scene data-scene-duration="200"></div>
```

In the above example, the animations inside the scene will run during the next `200px` once triggered.

## Reverse

Sets whether the scene animations should reverse when scrolling up.

| Property             | Builder Method | Type      | Default Value |
| -------------------- | -------------- | --------- | ------------- |
| `data-scene-reverse` | `.reverse()`   | `boolean` | `true`        |

**Example:**

```html
<div data-scene data-scene-reverse="false"></div>
```

## Enabled

Sets whether the scene is enabled or not. It's used with breakpoints to enable/disable scenes for different screen resolutions.

| Property             | Builder Method | Type      | Default Value |
| -------------------- | -------------- | --------- | ------------- |
| `data-scene-enabled` | `.enabled()`   | `boolean` | `true`        |

**Example:**

```html
<div data-scene data-scene-enabled="false"></div>
```

In the above example, no animation inside the scene will run.

## Indicator

Sets the indicators name for the scene.

When it's not empty, some elements will appear on the screen to indicate where the scene starts and ends.

It's used to debug scenes.

| Property               | Builder Method | Type     | Default Value |
| ---------------------- | -------------- | -------- | ------------- |
| `data-scene-indicator` | `.indicator()` | `string` | Empty         |

**Example:**

```html
<div data-scene data-scene-indicator="my-scene"></div>
```

In the above example, an indicator with the text "trigger" and an indicator with the text "start my-scene" will be added to the screen.

## Class Toggle

Sets class names that will be added to the HTML element of the scene when it starts.

| Property                  | Builder Method   | Type     | Default Value |
| ------------------------- | ---------------- | -------- | ------------- |
| `data-scene-class-toggle` | `.classToggle()` | `string` | Empty         |

**Example:**

```html
<div data-scene data-scene-class-toggle="bg-black text-white"></div>
```

When the scene starts, the HTML will look like:

```html
<div data-scene data-scene-class-toggle="bg-black text-white" class="bg-black text-white"></div>
```

> ⚠️ **Important:** At the moment there is one limitation. When using this property, pins and animations inside of the scene won't work.

## Pin

Pins the scene element for the duration of the scene.

| Property         | Builder Method | Type      | Default Value |
| ---------------- | -------------- | --------- | ------------- |
| `data-scene-pin` | `.pin()`       | `boolean` | `false`       |

When it's `true`, the element will stick in the screen for the duration of the scene.

If there is no `data-scene-duration`, the element will remain sticky indefinitely.

**Example:**

```html
<div data-scene data-scene-duration="200" data-scene-pin="true"></div>
```

In the above example, the HTML element of the scene will stick on the screen for the next 200px after the scene starts.

> ⚠️ **Important:** At the moment there is one limitation. When using this property, animations inside of the scene won't work.
