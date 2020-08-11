# ScrollXP

A library for scrolling animations.

It's based on [ScrollMagic](http://scrollmagic.io/) codebase and depends on [GSAP 3](https://greensock.com/).

See [demo](https://weareferal.github.io/scrollxp/) here.

## Features

_ScrollXP_ allows you to:

- Create animated scenes using HTML `data-*` attributes
- Create parallax effects using HTML `data-*` attributes
- Make responsive animations
- Bind menu active item to page section
- Enable/disable smooth scrolling

## Quick access

- [Installation](https://github.com/weareferal/scrollxp#installation)
- [Running local](https://github.com/weareferal/scrollxp#running-local)
- [Usage](https://github.com/weareferal/scrollxp#usage)
- [Smooth scrolling](https://github.com/weareferal/scrollxp#smooth-scrolling)
- [Debugging](https://github.com/weareferal/scrollxp#debugging)
- [Creating scenes](https://github.com/weareferal/scrollxp#creating-scenes)
- [Pinned scenes (or sticky elements)](https://github.com/weareferal/scrollxp#pinned-scenes-or-sticky-elements)
- [Custom scenes](https://github.com/weareferal/scrollxp#custom-scenes)
- [Scene limitations](https://github.com/weareferal/scrollxp#scene-limitations)
- [Adding animations](https://github.com/weareferal/scrollxp#adding-animations)
- [Reusable animations](https://github.com/weareferal/scrollxp#reusable-animations)
- [Animations "Under the Hood"](https://github.com/weareferal/scrollxp#animations-under-the-hood)
- [Parallax effect](https://github.com/weareferal/scrollxp#parallax-effect)
  - [Global parallax](https://github.com/weareferal/scrollxp#global-parallax)
  - [Scene parallax](https://github.com/weareferal/scrollxp#scene-parallax)
- [Working with breakpoints](https://github.com/weareferal/scrollxp#working-with-breakpoints)
- [Changing defaults](https://github.com/weareferal/scrollxp#changing-defaults)
- [Bind menu to page sections](https://github.com/weareferal/scrollxp#bind-menu-to-page-sections)
- [Motivation](https://github.com/weareferal/scrollxp#motivation)
- [TO DO](https://github.com/weareferal/scrollxp#to-do)
- [Versions](https://github.com/weareferal/scrollxp#versions)
- [License](https://github.com/weareferal/scrollxp#license)

## Installation

```
$ npm install gsap scrollxp --save
```

> **Note**: You need to use GSAP 3 or greater.

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

## Usage

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

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it's highly recommended to import it as an ES6 module with some bundlers like [webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org/):

```js
import ScrollXP from "scrollxp"

var view = new ScrollXP({
  container: document.querySelector(".wrapper"),
})
```

If you are not using any bundlers, you can just load the UMD bundles:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js"></script>
<script src="dist/scrollxp.js"></script>

<script>
  var view = new ScrollXP({
    container: document.querySelector(".wrapper"),
  })
</script>
```

### Full example

If you just want to make it work to play around, download the [scrollxp.js](https://github.com/weareferal/scrollxp/blob/master/dist/scrollxp.js) file and create a page with the following:

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js"></script>
    <script src="scrollxp.js"></script>
    <style>
      body {
        height: 100vh;
        overflow: hidden;
      }
      .wrapper {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
      .content {
        display: flex;
        align-items: center;
        height: 200vh;
      }
      .section {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .element {
        width: 300px;
        height: 300px;
        background-color: #000;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="content">
        <section class="section" data-scene data-scene-duration="100%" data-scene-indicator="box">
          <div class="element" data-animate data-animate-to-rotation="360"></div>
        </section>
      </div>
    </div>
    <script>
      new ScrollXP({
        container: document.querySelector(".wrapper"),
      });
    </script>
  </body>
</html>
```

You should see a black square spinning around when scrolling.

## Smooth scrolling

First, you need to install [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/):

```
$ npm install smooth-scrollbar --save
```

Then, just set the `smoothScrolling` flag in the constructor:

```
var view = new ScrollXP({
  container: document.querySelector('.wrapper'),
  smoothScrolling: true
})
```

Or call the method:

```
var view = new ScrollXP({
  container: document.querySelector('.wrapper')
})
view.smoothScrolling(true)
```

## Debugging

To debug your scenes and animations you can add indicators to all of them through a flag in the library constructor:

```
var view = new ScrollXP({
  container: document.querySelector('.wrapper'),
  addIndicators: true
})
```

Labels will be added to your page to show you the triggers and scenes positioning.

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

## Custom scenes

You may wish to setup the same scene in many places of your website, or call a custom method when a scene begin or end, for example.

For those cases, you can't simply use `data-*` attributes, but it's still possible by registering a custom scene.

To create a custom scene, first you need to register a scene modifier on JavaScript.

The first parameter is the name of the scene, the second one is a function that returns the properties.

For the moment, only some properties and methods are supported:

```
var view = new ScrollXP(...)

this.view.registerSceneModifier("my-custom-scene",
  function (domScene) {
    return {
      // Animation attributes inside custom scenes don't work, you can specify them here
      tween: gsap.to('#element', { duration: 1, autoAlpha: 0 }),
      // Scene duration
      duration: 400,
      // Scene hook
      hook: "onEnter",
      // Scene start offset in pixels
      offset: 100,
      // Scene pin element
      pin: domScene,
      // Scene reverse
      reverse: false,
      // onEnter callback
      onEnter(scene) {
        ...
      },
      // onProgress callback
      onProgress(scene) {

      }
    }
  })
```

Then, on the HTML you just need to set the scene like:

```
<div data-scene="my-custom-scene"></div>
```

## Scene limitations

At the moment, scenes have some limitations:

- If you use `data-scene-class-toggle`, pins, animations and scene modifiers won't apply.
- If you use `data-scene-pin`, animations and scene modifiers won't apply.
- If you use scene modifiers, animations won't apply.

## Adding animations

When you create a scene, _ScrollXP_ will generate a [Timeline](https://greensock.com/docs/v3/GSAP/Timeline).

Creating animations is like creating [GSAP tweens](https://greensock.com/docs/v3/GSAP/Tween).

For each DOM element inside the `data-scene` you want to animate, just add `data-animate` to it.

Then, in the same DOM element, you can setup your animation by adding properties like `data-animate-[property]`:

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |   Type    |   Default   | Description                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `from-alpha`                                                                                                                                                         | `number`  | `undefined` | Number between 0-1. Changes element opacity.                                                                                                                                                                       |
| `to-alpha`                                                                                                                                                           | `number`  | `undefined` | Number between 0-1. Changes element opacity.                                                                                                                                                                       |
| `from-x`                                                                                                                                                             | `number`  | `undefined` | Moves element horizontally. Sets initial position.                                                                                                                                                                 |
| `to-x`                                                                                                                                                               | `number`  | `undefined` | Moves element horizontally. Sets final position.                                                                                                                                                                   |
| `from-y`                                                                                                                                                             | `number`  | `undefined` | Moves element vertically. Sets initial position.                                                                                                                                                                   |
| `to-y`                                                                                                                                                               | `number`  | `undefined` | Moves element vertically. Sets initial position.                                                                                                                                                                   |
| `from-x-percent`                                                                                                                                                     | `number`  | `undefined` | Moves element horizontally. Sets initial position in percentage.                                                                                                                                                   |
| `to-x-percent`                                                                                                                                                       | `number`  | `undefined` | Moves element horizontally. Sets final position in percentage.                                                                                                                                                     |
| `from-y-percent`                                                                                                                                                     | `number`  | `undefined` | Moves element vertically. Sets initial position in percentage.                                                                                                                                                     |
| `to-y-percent`                                                                                                                                                       | `number`  | `undefined` | Moves element vertically. Sets final position in percentage.                                                                                                                                                       |
| `from-scale`                                                                                                                                                         | `number`  | `undefined` | Changes element scale. Sets initial scale.                                                                                                                                                                         |
| `to-scale`                                                                                                                                                           | `number`  | `undefined` | Changes element scale. Sets final scale.                                                                                                                                                                           |
| `from-rotation`                                                                                                                                                      | `number`  | `undefined` | Rotates element. Sets initial degree.                                                                                                                                                                              |
| `to-rotation`                                                                                                                                                        | `number`  | `undefined` | Rotates element. Sets final degree.                                                                                                                                                                                |
| `from-rotation-x`                                                                                                                                                    | `number`  | `undefined` | Rotates element along X-axis. Sets initial degree.                                                                                                                                                                 |
| `to-rotation-x`                                                                                                                                                      | `number`  | `undefined` | Rotates element along X-axis. Sets final degree.                                                                                                                                                                   |
| `from-rotation-y`                                                                                                                                                    | `number`  | `undefined` | Rotates element along Y-axis. Sets initial degree.                                                                                                                                                                 |
| `to-rotation-y`                                                                                                                                                      | `number`  | `undefined` | Rotates element along Y-axis. Sets final degree.                                                                                                                                                                   |
| `from-skew-x`                                                                                                                                                        | `number`  | `undefined` | Skews element along X-axis. Sets initial degree.                                                                                                                                                                   |
| `to-skew-x`                                                                                                                                                          | `number`  | `undefined` | Skews element along X-axis. Sets final degree.                                                                                                                                                                     |
| `from-skew-y`                                                                                                                                                        | `number`  | `undefined` | Skews element along Y-axis. Sets initial degree.                                                                                                                                                                   |
| `to-skew-y`                                                                                                                                                          | `number`  | `undefined` | Skews element along Y-axis. Sets final degree.                                                                                                                                                                     |
| `from-width`                                                                                                                                                         | `number`  | `undefined` | Resizes element. Sets initial width.                                                                                                                                                                               |
| `to-width`                                                                                                                                                           | `number`  | `undefined` | Resizes element. Sets final width.                                                                                                                                                                                 |
| `from-height`                                                                                                                                                        | `number`  | `undefined` | Resizes element. Sets initial height.                                                                                                                                                                              |
| `to-height`                                                                                                                                                          | `number`  | `undefined` | Resizes element. Sets final height.                                                                                                                                                                                |
| `delay`                                                                                                                                                              | `number`  | `undefined` | Animation's initial which is the length of time in seconds before the animation should begin. See [documentation](<https://greensock.com/docs/v3/GSAP/Timeline/delay()>).                                          |
| `label`                                                                                                                                                              | `string`  | `undefined` | Adds a label to the timeline, making it easy to mark important positions/times. See [documentation](<https://greensock.com/docs/v3/GSAP/Timeline/addLabel()>).                                                     |
| `position`                                                                                                                                                           | `string`  | `undefined` | The timeline position where the animation should begin. Use `start` to trigger animation when the scene begins, leave it undefined to animate sequentially.                                                        |
| `ease`                                                                                                                                                               | `string`  | `undefined` | Sets a GSAP ease function. See [ease visualizer](https://greensock.com/docs/v3/Eases).                                                                                                                             |
| `repeat`                                                                                                                                                             | `boolean` | `undefined` | Sets the number of times that the timeline should repeat after its first iteration. See [documentation](<https://greensock.com/docs/v3/GSAP/Timeline/repeat()>).                                                   |
| `yoyo`                                                                                                                                                               | `boolean` | `undefined` | Sets the timeline's yoyo state, where `true` causes the timeline to go back and forth, alternating backward and forward on each repeat. See [documentation](<https://greensock.com/docs/v3/GSAP/Timeline/yoyo()>). |
| `transform-origin`                                                                                                                                                   | `string`  | `undefined` | Sets element transform origin. Look for "transformOrigin" in GSAP [documentation](https://greensock.com/docs/v3/GSAP/CorePlugins/CSSPlugin).                                                                       |
| `duration`                                                                                                                                                           | `number`  | `undefined` | Sets the animation's duration.                                                                                                                                                                                     |
| `stagger`                                                                                                                                                            | `number`  | `undefined` | Amount of time in seconds to stagger the start time of each tween. **The DOM element children will be animated instead.**                                                                                          |

## Reusable animations

Like [custom scenes](https://github.com/weareferal/scrollxp#custom-scenes), you can avoid adding the same properties for a large amount of elements by creating an animation on JavaScript and setting it on HTML.

It's possible through the method `registerAnimation(name, properties)`.

For example, if you want to create a "fade in up" animation, first you have to register the animation on JS:

```
var view = new ScrollXP(...)

view.registerAnimation("fade-in-up", {
  duration: 1,
  from: {
    autoAlpha: 0,
    y: 20
  },
  to: {
    autoAlpha: 1,
    y: 0
  }
})
```

Then, in the HTML, you set the name for the animation:

```
<div data-scene>
  <div data-animate="fade-in-up"></div>
</div>
```

## Animations "Under the Hood"

When you set an attribute of `data-animate-from-*` or `data-animate-to-*`, the _tween_ uses:

- gsap method `fromTo()` in the case you're using at least one property of each. See [reference](<https://greensock.com/docs/v3/GSAP/gsap.fromTo()>).
- gsap method `from()` in the case you're only using `data-animate-from-*`. See [reference](<https://greensock.com/docs/v3/GSAP/gsap.from()>).
- gsap method `to()` in the case you're only using `data-animate-to-*`. See [reference](<https://greensock.com/docs/v3/GSAP/gsap.to()>).

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

## Changing defaults

You might need all your animations have a duration of `0.3` seconds, for example. Instead of setting `data-animate-duration="0.3"` for all your animations, you could simply change the animations default duration in the constructor:

```
var view = new ScrollXP({
  container: document.querySelector('main'),
  defaults: {
    animation: {
      duration: 0.3
    }
  }
})
```

Check below all the properties default values:

```
{
  parallax: {
    enabled: true,
    type: "global",
    speed: 1,
    momentum: 0.3,
    ease: "Power0.easeNone",
    trigger: document.body,
    duration: "100%",
    offset: 0,
    hook: "onCenter",
  },
  scene: {
    triggerHook: 0.5,
    duration: 0,
    reverse: true,
    pin: false,
    enabled: true,
  },
  animation: {
    duration: 1,
    position: "+=0",
    repeat: 0,
    yoyo: false,
    delay: 0,
    momentum: 0,
  }
}
```

## Bind menu to page sections

Two common features request that comes up when working with scroll animations are:

1. Highlight the menu when entering a page section
2. Scroll to the section when clicking on a menu option

_ScrollXP_ covers this feature with the method `bindAnchors()`.

You just need to pass a list of DOM elements with the **anchors** for the section.

For example, you have an HTML like this:

```
<ul>
  <li>
    <a href="#section1">Section 1</a>
  </li>
  <li>
    <a href="#section2">Section 2</a>
  </li>
  <li>
    <a href="#section3">Section 3</a>
  </li>
</ul>

<section id="section1">...</section>
<section id="section2">...</section>
<section id="section3">...</section>
```

Then, you can call the method for those anchors like:

```
var view = new ScrollXP(...)

var anchors = document.querySelectorAll("a[href^='#']")
view.bindAnchors(anchors)
```

Doing so, when clicking on a menu item or entering/leaving a page section, the class `is-active` is added/removed from the menu item.

**Important!**

Remember to register [ScrollToPlugin](https://greensock.com/scrolltoplugin/), otherwise it won't work properly:

If you're using a bundler:

```
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/all";
gsap.registerPlugin(ScrollToPlugin);
```

If not, just add the script:

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/ScrollToPlugin.min.js"></script>
```

## Motivation

_ScrollMagic_ is a fantastic library to handle animations when scrolling website pages. However, sooner or later, you'll find out that your project is becoming a huge plate of JavaScript spaghetti.

Besides, what if you want to disable some animations for small screens? Or just make it work different? How to keep your CSS breakpoints synced to your JS breakpoints?

Last, but not least, good luck if you're trying to use _ScrollMagic_ with any smooth scrolling lib.

With that in mind, _ScrollXP_ purposes:

- Use of _ScrollMagic_ + _GSAP_ without messing around with your JS files
- Easily allow responsive animations
- Enabling/disabling smooth scrolling with one line

## TO DO

There are still **a ton** of work to do here, above are just a few of them:

- [ ] Remove GSAP from the packaged library (currently it's being added twice)
- [ ] Clean up the library
- [ ] Write tests
- [ ] Add CI
- [ ] Validate library inputs
- [ ] Add scene property `data-scene-offset`
- [ ] Add scene property `data-scene-log-level`
- [ ] Work on scene limitations
- [ ] Add more animation options
- [ ] Support more parameters on custom scenes

## Versions

### v1.0.0

- Initial release

## License

[MIT](https://github.com/weareferal/scrollxp/blob/master/LICENSE)
