# ScrollXP

A toolkit for common scrolling animations using [ScrollMagic](http://scrollmagic.io/) + [GSAP](https://greensock.com/) + [Smooth Scrollbar](https://idiotwu.github.io/smooth-scrollbar/).

> *Stop suffering, focus on creating amazing pages.*

See [demo](https://weareferal.github.io/scrollxp/) here.

## Features

*ScrollXP* allows you to:

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

**>>> It won't work directly in the `body` element. <<<**

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

| Name                      | Type                 | Default     | Description |
|---------------------------|----------------------|-------------|-------------|
| `data-scene-trigger`      | `string`             | DOM element | Selector that defines the start of the scene. If undefined, the scene will start at the `data-scene` element.
| `data-scene-hook`         | `string` or `number` | `onCenter`  | Can be `onEnter`, `onCenter`, `onLeave` or a float number between 0-1
| `data-scene-duration`     | `string` or `number` | `0`         | The duration of the scene.
| `data-scene-reverse`      | `boolean`            | `true`      | Should the scene reverse, when scrolling up?
| `data-scene-enabled`      | `boolean`            | `true`      | Use it to disable the scene for other screen sizes. Check out breakpoints section.
| `data-scene-indicator`    | `string`             | `null`      | Add visual indicators. Use it to debug.
| `data-scene-class-toggle` | `string`             | `null`      | One or more Classnames (separated by space) that should be added to the element during the scene.
| `data-scene-pin`          | `boolean`            | `false`     | Pin the element for the duration of the scene.

**Limitations:**
- If you use `data-scene-class-toggle`, pins, animations and scene modifiers won't apply.
- If you use `data-scene-pin="true"`,  animations and scene modifiers won't apply.
- If you use scene modifiers, animations won't apply.

**TODO:**
- [ ] Add `data-scene-offset`
- [ ] Add `data-scene-log-level`

## Adding animations



### Pinned Scenes

### Registering custom scene

TODO: Explain why and how to use in JS and HTML

### Registering custom animation

TODO: Explain why and how to use in JS and HTML

## Parallax Scene

## Parallax Global

## Working with breakpoints

## Bind menu to page sections

## Limitations

TODO: Talk about restrictions

## Motivation

*ScrollMagic* is a fantastic library to handle animations when scrolling website pages. However, sooner or later, you'll find out that your project is becoming a huge plate of JavaScript spaghetti.

Besides, what if you want to disable some animations for small screens? Or just make it work different? How to keep your CSS breakpoints synced to your JS breakpoints?

Last, but not least, good luck if you're trying to use *ScrollMagic* with any smooth scrolling lib.

With that in mind, *ScrollXP* purposes:
- Use of *ScrollMagic* + *GSAP* without messing around with your JS files
- Easily allow responsive animations
- Enabling/disabling smooth scrolling with one line

## Versions

TODO: Add versions
