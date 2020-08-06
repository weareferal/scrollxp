# ScrollXP

A toolkit for common scrolling animations using [ScrollMagic](http://scrollmagic.io/) + [GSAP](https://greensock.com/) + [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/).

> _Stop suffering, focus on creating amazing pages._

See [demo](https://weareferal.github.io/scrollxp/) here.

## Features

_ScrollXP_ allows you to:

- Create animated scenes using HTML `data-*` attributes
- Create parallax effects using HTML `data-*` attributes
- Make responsive animations
- Bind menu active item to page section
- Enable/disable smooth scrolling

## Installation

TODO: Publish into npm

```
$ npm install scrollxp --save
```

## Running local

To get it up and running, run:

```
$ npm install
```

Then:

```
$ gulp
```

## Initialize

First, you need to make sure you're initializing it into a scrollable container.

⚠️ **It won't work directly in the `body` element.**

To make it work in the body, here is what you have to do:

Add this to its styles:

```
body {
  height: 100vh;
  overflow: hidden;
}
```

Then, create a container to wrap up your content:

```
.wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
}
```

Now, initialize the container in your JavaScript:

```
var view = new ScrollView({
  container: document.querySelector('.wrapper'),
  smoothScrolling: false
});
```

## Creating Scenes

A scene works like a [ScrollMagic scene](https://scrollmagic.io/docs/ScrollMagic.Scene.html).

However, instead of creating the scene in the JavaScript, you're going to use `data-*` attributes.

Add `data-scene` to your scene container, it will indicate you're creating a scene.

Then, in the same DOM element, you can setup the scene by adding those optional properties:

| Name                      | Type                 | Default     | Description                                                                                                                                                                               |
| ------------------------- | -------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-scene-trigger`      | `string`             | DOM element | Selector that defines the start of the scene. If undefined, the scene will start at the `data-scene` element.                                                                             |
| `data-scene-hook`         | `string` or `number` | `onCenter`  | Can be `onEnter`, `onCenter`, `onLeave` or a float number between 0-1                                                                                                                     |
| `data-scene-duration`     | `string` or `number` | `0`         | The duration of the scene. `100%` will keep the duration always exactly at the inner height of the scroll container. `0` means that the scene is 'open end' and no end will be triggered. |
| `data-scene-reverse`      | `boolean`            | `true`      | Should the scene reverse, when scrolling up?                                                                                                                                              |
| `data-scene-enabled`      | `boolean`            | `true`      | Use it to disable the scene for other screen sizes. Check out breakpoints section.                                                                                                        |
| `data-scene-indicator`    | `string`             | `null`      | Add visual indicators. Use it to debug.                                                                                                                                                   |
| `data-scene-class-toggle` | `string`             | `null`      | One or more Classnames (separated by space) that should be added to the element during the scene.                                                                                         |
| `data-scene-pin`          | `boolean`            | `false`     | Pin the element for the duration of the scene.                                                                                                                                            |

**Limitations**

At the moment, scenes have some limitations:

- If you use `data-scene-class-toggle`, pins, animations and scene modifiers won't apply.
- If you use `data-scene-pin`, animations and scene modifiers won't apply.
- If you use scene modifiers, animations won't apply.

**TODO:**

- [ ] Add `data-scene-offset`
- [ ] Add `data-scene-log-level`
- [ ] Work on limitations

## Adding animations

When you create a scene, _ScrollXP_ will generate a [TimelineMax](https://greensock.com/timelinemax/).

Creating animations is like creating [GSAP tweens](https://greensock.com/docs/v2/GSAP/Tween), but with `data-*` attributes.

For each DOM element inside the `data-scene` you want animate, just add `data-animate` to it.

Then, you can setup your animation by adding those properties:

| Name                            | Type      | Default | Description                                                                                                                                                                                                      |
| ------------------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-animate-from-alpha`       | `number`  | `null`  | Number between 0-1. Changes element opacity.                                                                                                                                                                     |
| `data-animate-to-alpha`         | `number`  | `null`  | Number between 0-1. Changes element opacity.                                                                                                                                                                     |
| `data-animate-from-x`           | `number`  | `null`  | Moves element horizontally. Sets initial position.                                                                                                                                                               |
| `data-animate-to-x`             | `number`  | `null`  | Moves element horizontally. Sets final position.                                                                                                                                                                 |
| `data-animate-from-y`           | `number`  | `null`  | Moves element vertically. Sets initial position.                                                                                                                                                                 |
| `data-animate-to-y`             | `number`  | `null`  | Moves element vertically. Sets initial position.                                                                                                                                                                 |
| `data-animate-from-x-percent`   | `number`  | `null`  | Moves element horizontally. Sets initial position in percentage.                                                                                                                                                 |
| `data-animate-to-x-percent`     | `number`  | `null`  | Moves element horizontally. Sets final position in percentage.                                                                                                                                                   |
| `data-animate-from-y-percent`   | `number`  | `null`  | Moves element vertically. Sets initial position in percentage.                                                                                                                                                   |
| `data-animate-to-y-percent`     | `number`  | `null`  | Moves element vertically. Sets final position in percentage.                                                                                                                                                     |
| `data-animate-from-scale`       | `number`  | `null`  | Changes element scale. Sets initial scale.                                                                                                                                                                       |
| `data-animate-to-scale`         | `number`  | `null`  | Changes element scale. Sets final scale.                                                                                                                                                                         |
| `data-animate-from-rotation`    | `number`  | `null`  | Rotates element. Sets initial degree.                                                                                                                                                                            |
| `data-animate-to-rotation`      | `number`  | `null`  | Rotates element. Sets final degree.                                                                                                                                                                              |
| `data-animate-from-rotation-x`  | `number`  | `null`  | Rotates element along X-axis. Sets initial degree.                                                                                                                                                               |
| `data-animate-to-rotation-x`    | `number`  | `null`  | Rotates element along X-axis. Sets final degree.                                                                                                                                                                 |
| `data-animate-from-rotation-y`  | `number`  | `null`  | Rotates element along Y-axis. Sets initial degree.                                                                                                                                                               |
| `data-animate-to-rotation-y`    | `number`  | `null`  | Rotates element along Y-axis. Sets final degree.                                                                                                                                                                 |
| `data-animate-from-skew-x`      | `number`  | `null`  | Skews element along X-axis. Sets initial degree.                                                                                                                                                                 |
| `data-animate-to-skew-x`        | `number`  | `null`  | Skews element along X-axis. Sets final degree.                                                                                                                                                                   |
| `data-animate-from-skew-y`      | `number`  | `null`  | Skews element along Y-axis. Sets initial degree.                                                                                                                                                                 |
| `data-animate-to-skew-y`        | `number`  | `null`  | Skews element along Y-axis. Sets final degree.                                                                                                                                                                   |
| `data-animate-from-width`       | `number`  | `null`  | Resizes element. Sets initial width.                                                                                                                                                                             |
| `data-animate-to-width`         | `number`  | `null`  | Resizes element. Sets final width.                                                                                                                                                                               |
| `data-animate-from-height`      | `number`  | `null`  | Resizes element. Sets initial height.                                                                                                                                                                            |
| `data-animate-to-height`        | `number`  | `null`  | Resizes element. Sets final height.                                                                                                                                                                              |
| `data-animate-delay`            | `number`  | `null`  | Animation's initial which is the length of time in seconds before the animation should begin. See [documentation](<https://greensock.com/docs/v2/TimelineMax/delay()>).                                          |
| `data-animate-label`            | `string`  | `null`  | Adds a label to the timeline, making it easy to mark important positions/times. See [documentation](<https://greensock.com/docs/v2/TimelineMax/addLabel()>).                                                     |
| `data-animate-transition`       | `string`  | `null`  | CSS transition, it's the same than add an inline transition style                                                                                                                                                |
| `data-animate-position`         | `string`  | `null`  | The timeline position where the animation should begin. Use `start` to trigger animation when the scene begins, leave it undefined to animate sequentially.                                                      |
| `data-animate-ease`             | `string`  | `null`  | Sets a GSAP ease function. See [ease visualizer](https://greensock.com/ease-visualizer/).                                                                                                                        |
| `data-animate-repeat`           | `boolean` | `null`  | Sets the number of times that the timeline should repeat after its first iteration. See [documentation](<https://greensock.com/docs/v2/TimelineMax/repeat()>).                                                   |
| `data-animate-yoyo`             | `boolean` | `null`  | Sets the timeline's yoyo state, where `true` causes the timeline to go back and forth, alternating backward and forward on each repeat. See [documentation](<https://greensock.com/docs/v2/TimelineMax/yoyo()>). |
| `data-animate-transform-origin` | `string`  | `null`  | Sets element transform origin. Look for "transformOrigin" in GSAP [documentation](https://greensock.com/docs/v2/Plugins/CSSPlugin).                                                                              |
| `data-animate-duration`         | `number`  | `null`  | Sets the animation's duration.                                                                                                                                                                                   |
| `data-animate-stagger`          | `number`  | `null`  | Amount of time in seconds to stagger the start time of each tween. **The DOM element children will be animated instead.**                                                                                        |

**Under the hood:**

When you set an attribute of `data-animate-from-*` or `data-animate-to-*`, the _tween_ uses:

- TimelineMax method `fromTo()` in the case you're using at least one property of each. See [reference](<https://greensock.com/docs/v2/TweenMax/static.fromTo()>).
- TimelineMax method `from()` in the case you're only using `data-animate-from-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.from()>).
- TimelineMax method `to()` in the case you're only using `data-animate-to-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.to()>).

When you add a `data-animate-stagger` attribute to your element, the _tween_ uses:

- TimelineMax method `staggerFromTo()` in the case you're using at least one property of each. See [reference](<https://greensock.com/docs/v2/TweenMax/static.staggerFromTo()>).
- TimelineMax method `staggerFrom()` in the case you're only using `data-animate-from-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.staggerFrom()>).
- TimelineMax method `staggerTo()` in the case you're only using `data-animate-to-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.staggerTo()>).

**TODO:**

- [ ] Add more animation options

### Pinned Scenes

### Registering custom scene

You may wish to setup the same scene in many places of your website, or call a custom method when a scene begin or end, for example.

For those cases, you can't simply use `data-*` attributes, but it's still possible by registering a scene.

TODO: Explain why and how to use in JS and HTML (explaing priorities as well)

TODO:

- [ ] Improve priorities

### Registering custom animation

TODO: Explain why and how to use in JS and HTML

## Parallax Scene

## Parallax Global

## Working with breakpoints

## Bind menu to page sections

## Limitations

TODO: Talk about restrictions

## Motivation

_ScrollMagic_ is a fantastic library to handle animations when scrolling website pages. However, sooner or later, you'll find out that your project is becoming a huge plate of JavaScript spaghetti.

Besides, what if you want to disable some animations for small screens? Or just make it work different? How to keep your CSS breakpoints synced to your JS breakpoints?

Last, but not least, good luck if you're trying to use _ScrollMagic_ with any smooth scrolling lib.

With that in mind, _ScrollXP_ purposes:

- Use of _ScrollMagic_ + _GSAP_ without messing around with your JS files
- Easily allow responsive animations
- Enabling/disabling smooth scrolling with one line

## Versions

TODO: Add versions
