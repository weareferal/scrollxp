# ScrollXP

_ScrollXP_ is a library that makes it easy to create scrolling animations using HTML data attributes.

## Demos

- [Fade In Down Animation](https://codepen.io/weareferal/full/eYdNNzq)
- [Piano Key Animation](https://codepen.io/weareferal/full/WNGvvpY)
- [Parallax Animation](https://codepen.io/weareferal/full/abmOOwd)
- [Full Example](https://weareferal.github.io/scrollxp/)

## Quick Access

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](https://github.com/weareferal/scrollxp/blob/master/docs/configuration.md)
  - [Debug](https://github.com/weareferal/scrollxp/blob/master/docs/configuration.md#debug)
  - [Breakpoints](https://github.com/weareferal/scrollxp/blob/master/docs/configuration.md#breakpoints)
  - [Scroll To Anchors](https://github.com/weareferal/scrollxp/blob/master/docs/configuration.md#scroll-to-anchors)
  - [Smooth Scrolling](https://github.com/weareferal/scrollxp/blob/master/docs/configuration.md#smooth-scrolling)
- [Scene](https://github.com/weareferal/scrollxp/blob/master/docs/scene/README.md)
- [Animation](https://github.com/weareferal/scrollxp/blob/master/docs/animation/README.md)
- [Parallax](https://github.com/weareferal/scrollxp/blob/master/docs/parallax/README.md)
- [Development](https://github.com/weareferal/scrollxp/blob/master/docs/development.md)

## Installation

Via **NPM**:

```
$ npm install gsap scrollxp --save
```

> **Note**: You need to use GSAP 3 or greater.

Include it in your script:

```js
import ScrollXP from "scrollxp"
```

Or via **CDN**:

```html
<script src="https://unpkg.com/gsap/dist/gsap.min.js"></script>
<script src="https://unpkg.com/scrollxp/dist/scrollxp.min.js"></script>
```

## Usage

```js
new ScrollXP({
  container: document.body,
})
```

Check the documentation about how to create [scenes](https://github.com/weareferal/scrollxp/blob/master/docs/scene/README.md), [animations](https://github.com/weareferal/scrollxp/blob/master/docs/animation/README.md) and [parallax effect](https://github.com/weareferal/scrollxp/blob/master/docs/parallax/README.md).

## Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://unpkg.com/gsap/dist/gsap.min.js"></script>
    <script src="https://unpkg.com/scrollxp/dist/scrollxp.min.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        display: flex;
        align-items: center;
        height: 200vh;
      }

      section {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      section>div {
        width: 300px;
        height: 300px;
        border: 10px solid #000;
      }
    </style>
  </head>
  <body>
    <section data-scene data-scene-duration="100%" data-scene-indicator="scene">
      <div data-animate data-animate-to-rotation="360"></div>
    </section>
    <script>
      new ScrollXP({
        container: document.body,
      });
    </script>
  </body>
</html>
```

## Questions?

File a [GitHub issue](https://github.com/weareferal/scrollxp/issues/new) please.

## Author

[Feral](https://weareferal.com/)

## License

_ScrollXP_ is available under the MIT license. See the [LICENSE](https://github.com/weareferal/scrollxp/blob/master/LICENSE) file for more info.
