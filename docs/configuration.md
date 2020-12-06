# Configuration

## Debug

To debug your scenes and animations you can add indicators to all of them through a flag in the library constructor:

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
  addIndicators: true,
})
```

Labels will be added to your page to show you the triggers and scenes positioning.

It's also possible to add indicators for specific scenes insteand through the [indicator property](scene/scene-properties.md#indicator).

## Breakpoints

One of the most useful things about _ScrollXP_ is its capability of working with breakpoints.

As default, the breakpoints that the library works with looks like:

```js
{
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
}
```

You can change those values by setting a new JSON object when initializing the library, for example:

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
  },
})
```

> **Note:** In the above example, it'll only be used the specfied breakpoints. In that case, `xl` and `xxl` won't exist anymore.

To make the properties responsive, you have to specify the breakpoints when adding **attribute properties**.

The syntaxe looks like `data-[breakpoint]-[function]-[property-name]`.

**Example 1:**

```html
<div data-scene data-xs-scene-enable="false" data-md-scene-enable="true"></div>
```

In the above example, the scene is disabled for `xs` resolutions and enabled for resolutions >= `md`.

**Example 2:**

```html
<div data-scene>
  <div data-animate data-animate-from-alpha="0" data-md-animate-to-alpha="0.5" data-lg-animate-to-alpha="1"></div>
</div>
```

In the above example, the HTML element will:

- Keep with opacity `0` for resolutions < `md`
- Animate from opacity `0` to opacity `0.5` for resolutions >= `md` and < `lg`
- Animate from opacity `0` to opacity `1` for resolutions >= `lg`

**Example 3:**

```html
<div data-parallax data-lg-parallax-speed="2" data-xl-parallax-speed="4"></div>
```

In the above example, the HTML element will:

- Keep a speed ratio of `1` for resolutions < `lg`
- Change speed ratio to `2` for resolutions >= `lg` and < `xl`
- Change speed ratio to `4` for resolutions >= `lg`

> **Note:** All the properties of scenes, animations and parallax accept this syntax.

## Scroll To Anchors

Two common features request that comes up when working with scroll animations are:

1. Highlight the menu when entering a page section
2. Scroll to the section when clicking on a menu option

_ScrollXP_ covers this feature with the method `bindAnchors()`.

You just need to pass a list of DOM elements with the **anchors** for the section.

For example, you have an HTML structure like this:

```html
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

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.body,
})

let anchors = document.querySelectorAll("a[href^='#']")
view.bindAnchors(anchors)
```

Doing so, when clicking on a menu item or entering/leaving a page section, the class `is-active` is added/removed from the menu item.

**Important!**

Remember to register [ScrollToPlugin](https://greensock.com/scrolltoplugin/), otherwise it won't work properly:

If you're using a bundler:

```js
import gsap from "gsap"
import { ScrollToPlugin } from "gsap/all"
gsap.registerPlugin(ScrollToPlugin)
```

If not, just add the script:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/ScrollToPlugin.min.js"></script>
```

## Smooth Scrolling

_ScrollXP_ uses [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/) for that.

First, you need to make sure you're initializing it into a scrollable container.

⚠️ **It won't work directly in the `body` element.**

To make it work in the body, here is what you have to do:

Add this to its styles:

```css
body {
  height: 100vh;
  overflow: hidden;
}
```

Then, create a container to wrap up your content:

```css
.wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
}
```

And initialize the library in the `.wrapper` element, making sure to set the `smoothScrolling` flag in the constructor:

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.querySelector(".wrapper"),
  smoothScrolling: true,
})
```

Or call the method:

```js
import ScrollXP from "scrollxp"

let view = new ScrollXP({
  container: document.querySelector(".wrapper"),
})

view.smoothScrolling(true)
```
