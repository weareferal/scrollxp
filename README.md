# ScrollXP

A library for scrolling animations based on [ScrollMagic](http://scrollmagic.io/) + [GSAP](https://greensock.com/) + [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/).

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
$ npm run start
```

Then access `http://localhost:3000`

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
var view = new ScrollXP({
  container: document.querySelector('.wrapper'),
  smoothScrolling: false
});
```

## Creating scenes

A scene works like a [ScrollMagic scene](https://scrollmagic.io/docs/ScrollMagic.Scene.html).

However, instead of creating the scene in the JavaScript, you're going to use `data-*` attributes.

Add `data-scene` to your scene container, it will indicate you're creating a scene.

Then, in the same DOM element, you can setup the scene by adding properties like `data-scene-[property]`:

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |         Type         |   Default   | Description                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------- | :------------------: | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger`                                                                                    |       `string`       | DOM element | Selector that defines the start of the scene. If undefined, the scene will start at the `data-scene` element.                                                                             |
| `hook`                                                                                       | `string` or `number` | `onCenter`  | Can be `onEnter`, `onCenter`, `onLeave` or a float number between 0-1                                                                                                                     |
| `duration`                                                                                   | `string` or `number` |     `0`     | The duration of the scene. `100%` will keep the duration always exactly at the inner height of the scroll container. `0` means that the scene is 'open end' and no end will be triggered. |
| `reverse`                                                                                    |      `boolean`       |   `true`    | Should the scene reverse when scrolling up?                                                                                                                                               |
| `enabled`                                                                                    |      `boolean`       |   `true`    | Use it to disable the scene for other screen sizes. Check out the breakpoints section.                                                                                                    |
| `indicator`                                                                                  |       `string`       | `undefined` | Add visual indicators. Use it to debug.                                                                                                                                                   |
| `class-toggle`                                                                               |       `string`       | `undefined` | One or more Classnames (separated by space) that should be added to the element during the scene.                                                                                         |
| `pin`                                                                                        |      `boolean`       |   `false`   | Pin the element for the duration of the scene.                                                                                                                                            |

## Pinned scenes (or sticky elements)

You can create sticky elements by setting `data-scene-pin="true"`. It's going to work like in this [ScrollMagic example](https://scrollmagic.io/examples/basic/simple_pinning.html).

Its duration is defined through `data-scene-duration`. If the scene duration isn't set, the element remains sticky till the page end.

## Scene limitations

At the moment, scenes have some limitations:

- If you use `data-scene-class-toggle`, pins, animations and scene modifiers won't apply.
- If you use `data-scene-pin`, animations and scene modifiers won't apply.
- If you use scene modifiers, animations won't apply.

## Adding animations

When you create a scene, _ScrollXP_ will generate a [TimelineMax](https://greensock.com/timelinemax/).

Creating animations is like creating [GSAP tweens](https://greensock.com/docs/v2/GSAP/Tween).

For each DOM element inside the `data-scene` you want to animate, just add `data-animate` to it.

Then, in the same DOM element, you can setup your animation by adding properties like `data-animate-[property]`:

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |   Type    |   Default   | Description                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: | :---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from-alpha`                                                                                                                                                         | `number`  | `undefined` | Number between 0-1. Changes element opacity.                                                                                                                                                                     |
| `to-alpha`                                                                                                                                                           | `number`  | `undefined` | Number between 0-1. Changes element opacity.                                                                                                                                                                     |
| `from-x`                                                                                                                                                             | `number`  | `undefined` | Moves element horizontally. Sets initial position.                                                                                                                                                               |
| `to-x`                                                                                                                                                               | `number`  | `undefined` | Moves element horizontally. Sets final position.                                                                                                                                                                 |
| `from-y`                                                                                                                                                             | `number`  | `undefined` | Moves element vertically. Sets initial position.                                                                                                                                                                 |
| `to-y`                                                                                                                                                               | `number`  | `undefined` | Moves element vertically. Sets initial position.                                                                                                                                                                 |
| `from-x-percent`                                                                                                                                                     | `number`  | `undefined` | Moves element horizontally. Sets initial position in percentage.                                                                                                                                                 |
| `to-x-percent`                                                                                                                                                       | `number`  | `undefined` | Moves element horizontally. Sets final position in percentage.                                                                                                                                                   |
| `from-y-percent`                                                                                                                                                     | `number`  | `undefined` | Moves element vertically. Sets initial position in percentage.                                                                                                                                                   |
| `to-y-percent`                                                                                                                                                       | `number`  | `undefined` | Moves element vertically. Sets final position in percentage.                                                                                                                                                     |
| `from-scale`                                                                                                                                                         | `number`  | `undefined` | Changes element scale. Sets initial scale.                                                                                                                                                                       |
| `to-scale`                                                                                                                                                           | `number`  | `undefined` | Changes element scale. Sets final scale.                                                                                                                                                                         |
| `from-rotation`                                                                                                                                                      | `number`  | `undefined` | Rotates element. Sets initial degree.                                                                                                                                                                            |
| `to-rotation`                                                                                                                                                        | `number`  | `undefined` | Rotates element. Sets final degree.                                                                                                                                                                              |
| `from-rotation-x`                                                                                                                                                    | `number`  | `undefined` | Rotates element along X-axis. Sets initial degree.                                                                                                                                                               |
| `to-rotation-x`                                                                                                                                                      | `number`  | `undefined` | Rotates element along X-axis. Sets final degree.                                                                                                                                                                 |
| `from-rotation-y`                                                                                                                                                    | `number`  | `undefined` | Rotates element along Y-axis. Sets initial degree.                                                                                                                                                               |
| `to-rotation-y`                                                                                                                                                      | `number`  | `undefined` | Rotates element along Y-axis. Sets final degree.                                                                                                                                                                 |
| `from-skew-x`                                                                                                                                                        | `number`  | `undefined` | Skews element along X-axis. Sets initial degree.                                                                                                                                                                 |
| `to-skew-x`                                                                                                                                                          | `number`  | `undefined` | Skews element along X-axis. Sets final degree.                                                                                                                                                                   |
| `from-skew-y`                                                                                                                                                        | `number`  | `undefined` | Skews element along Y-axis. Sets initial degree.                                                                                                                                                                 |
| `to-skew-y`                                                                                                                                                          | `number`  | `undefined` | Skews element along Y-axis. Sets final degree.                                                                                                                                                                   |
| `from-width`                                                                                                                                                         | `number`  | `undefined` | Resizes element. Sets initial width.                                                                                                                                                                             |
| `to-width`                                                                                                                                                           | `number`  | `undefined` | Resizes element. Sets final width.                                                                                                                                                                               |
| `from-height`                                                                                                                                                        | `number`  | `undefined` | Resizes element. Sets initial height.                                                                                                                                                                            |
| `to-height`                                                                                                                                                          | `number`  | `undefined` | Resizes element. Sets final height.                                                                                                                                                                              |
| `delay`                                                                                                                                                              | `number`  | `undefined` | Animation's initial which is the length of time in seconds before the animation should begin. See [documentation](<https://greensock.com/docs/v2/TimelineMax/delay()>).                                          |
| `label`                                                                                                                                                              | `string`  | `undefined` | Adds a label to the timeline, making it easy to mark important positions/times. See [documentation](<https://greensock.com/docs/v2/TimelineMax/addLabel()>).                                                     |
| `position`                                                                                                                                                           | `string`  | `undefined` | The timeline position where the animation should begin. Use `start` to trigger animation when the scene begins, leave it undefined to animate sequentially.                                                      |
| `ease`                                                                                                                                                               | `string`  | `undefined` | Sets a GSAP ease function. See [ease visualizer](https://greensock.com/ease-visualizer/).                                                                                                                        |
| `repeat`                                                                                                                                                             | `boolean` | `undefined` | Sets the number of times that the timeline should repeat after its first iteration. See [documentation](<https://greensock.com/docs/v2/TimelineMax/repeat()>).                                                   |
| `yoyo`                                                                                                                                                               | `boolean` | `undefined` | Sets the timeline's yoyo state, where `true` causes the timeline to go back and forth, alternating backward and forward on each repeat. See [documentation](<https://greensock.com/docs/v2/TimelineMax/yoyo()>). |
| `transform-origin`                                                                                                                                                   | `string`  | `undefined` | Sets element transform origin. Look for "transformOrigin" in GSAP [documentation](https://greensock.com/docs/v2/Plugins/CSSPlugin).                                                                              |
| `duration`                                                                                                                                                           | `number`  | `undefined` | Sets the animation's duration.                                                                                                                                                                                   |
| `stagger`                                                                                                                                                            | `number`  | `undefined` | Amount of time in seconds to stagger the start time of each tween. **The DOM element children will be animated instead.**                                                                                        |

## Animations "Under the Hood"

When you set an attribute of `data-animate-from-*` or `data-animate-to-*`, the _tween_ uses:

- TimelineMax method `fromTo()` in the case you're using at least one property of each. See [reference](<https://greensock.com/docs/v2/TweenMax/static.fromTo()>).
- TimelineMax method `from()` in the case you're only using `data-animate-from-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.from()>).
- TimelineMax method `to()` in the case you're only using `data-animate-to-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.to()>).

When you add a `data-animate-stagger` attribute to your element, the _tween_ uses:

- TimelineMax method `staggerFromTo()` in the case you're using at least one property of each. See [reference](<https://greensock.com/docs/v2/TweenMax/static.staggerFromTo()>).
- TimelineMax method `staggerFrom()` in the case you're only using `data-animate-from-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.staggerFrom()>).
- TimelineMax method `staggerTo()` in the case you're only using `data-animate-to-*`. See [reference](<https://greensock.com/docs/v2/TweenMax/static.staggerTo()>).

### Registering custom scene

You may wish to setup the same scene in many places of your website, or call a custom method when a scene begin or end, for example.

For those cases, you can't simply use `data-*` attributes, but it's still possible by registering a scene.

TO DO: Explain why and how to use in JS and HTML (explaing priorities as well)

TO DO:

- [ ] Improve priorities

### Registering custom animation

TO DO: Explain why and how to use in JS and HTML

## Parallax effect

There are two ways to set up parallax elements with _ScrollXP_, you have **global** elements and **scene** elements.

For default, every parallax element is created as a **global** element.

### Global parallax

A global parallax element will be active throughout the extension of the _ScrollXP_ container.

To define such component, you just need to add the attribute `data-parallax` on a DOM element.

Then, in the same DOM element, you can setup the parallax effect by adding properties like `data-parallax-[property]="[value]"`:

| Property   |   Type    |      Default      | Description                                                                                                                                                                                                                   |
| ---------- | :-------: | :---------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `speed`    | `number`  |        `1`        | Sets the speed ratio. When scrolling, the element will move 1/`speed` times the original distance, i.e. the further from zero, the slower it moves. Negative values make the element move to the scroll opposite direction.   |
| `momentum` | `number`  |       `0.3`       | Sets the time in seconds that the element will take to reach its final position.                                                                                                                                              |
| `ease`     | `string`  | `Power0.easeNone` | Sets a GSAP ease function, which will be for the momentum to move the element until its final position. For default, the element moves over a linear function. See [ease visualizer](https://greensock.com/ease-visualizer/). |
| `stagger`  | `number`  |    `undefined`    | Amount of time in seconds to stagger the start time of each tween. **The DOM element children will be animated instead.**                                                                                                     |
| `enabled`  | `boolean` |      `true`       | Use it to disable the parallax for other screen sizes. Check out the breakpoints section.                                                                                                                                     |

### Scene parallax

This type of parallax effect has a start and an end, behaving like a common animation scene.

To define the element, you need to add the attribute `data-parallax="scene"`.

All the global parallax properties are used for this type of effect too, but you can also provide properties for the scene itself.

So, in the same DOM element, you can add the properties below:

| Property    |         Type         |   Default   | Description                                                                                                                                                                               |
| ----------- | :------------------: | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger`   |       `string`       | DOM element | Selector that defines the start of the scene. If undefined, the scene will start at the `data-scene` element.                                                                             |
| `hook`      | `string` or `number` | `onCenter`  | Can be `onEnter`, `onCenter`, `onLeave` or a float number between 0-1                                                                                                                     |
| `duration`  | `string` or `number` |     `0`     | The duration of the scene. `100%` will keep the duration always exactly at the inner height of the scroll container. `0` means that the scene is 'open end' and no end will be triggered. |
| `offset`    |       `number`       |     `0`     | The offset in pixels for the scene start.                                                                                                                                                 |
| `indicator` |       `string`       | `undefined` | Add visual indicators. Use it to debug.                                                                                                                                                   |

## Working with breakpoints

One of the most useful things about _ScrollXP_ is its capability of working with breakpoints.

For default, the breakpoints that the library works with looks like:

```
{
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
}
```

You can change those values by setting a new JSON object when initializing the library, for example:

```
var view = new ScrollXP({
  container: document.querySelector('main'),
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024
  }
})
```

> **Note:** In the above example, it'll only be used the specfied breakpoints, `xl` and `xxl` won't exist anymore.

To make the properties responsive, you have to specify the breakpoints when adding properties with `data-*`.

The breakpoint key comes right after `data` and before the property.

For example, if you want to enable a scene for the `md` breakpoint only, you need to disable the scene for `xs` and then enable it for `md`, like:

```
<div data-scene data-xs-scene-enable="false" data-md-scene-enable="true"></div>
```

All the properties accept this syntax.

## Bind menu to page sections

## Motivation

_ScrollMagic_ is a fantastic library to handle animations when scrolling website pages. However, sooner or later, you'll find out that your project is becoming a huge plate of JavaScript spaghetti.

Besides, what if you want to disable some animations for small screens? Or just make it work different? How to keep your CSS breakpoints synced to your JS breakpoints?

Last, but not least, good luck if you're trying to use _ScrollMagic_ with any smooth scrolling lib.

With that in mind, _ScrollXP_ purposes:

- Use of _ScrollMagic_ + _GSAP_ without messing around with your JS files
- Easily allow responsive animations
- Enabling/disabling smooth scrolling with one line

## TO DO

- [ ] Add `data-scene-offset`
- [ ] Add `data-scene-log-level`
- [ ] Work on scene limitations
- [ ] Add more animation options

## Versions

TODO: Add versions
