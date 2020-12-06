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
- [Configuration](/docs/configuration.md)
  - [Debug](/docs/configuration.md#debug)
  - [Breakpoints](/docs/configuration.md#breakpoints)
  - [Scroll To Anchors](/docs/configuration.md#scroll-to-anchors)
  - [Smooth Scrolling](/docs/configuration.md#smooth-scrolling)
- [Scene](/docs/scene/README.md)
- [Animation](/docs/animation/README.md)
- [Parallax](/docs/parallax/README.md)
- [Development](/docs/development.md)

## Installation

Via **NPM**:

```
$ npm install gsap scrollxp --save
```

> **Note**: You need to use GSAP 3 or greater.

Include it in your script.

```js
import ScrollXP from "scrollxp"
```

Or via **CDN**:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js"></script>
<script src="https://cdn.weareferal.com/scrollxp-2.0.3.js"></script>
```

## Usage

```js
let view = new ScrollXP({
  container: document.body,
})
```

## Questions?

File a [GitHub issue](https://github.com/weareferal/scrollxp/issues/new) please.

## Author

[Feral](https://weareferal.com/)

## License

_ScrollXP_ is available under the MIT license. See the [LICENSE](https://github.com/weareferal/scrollxp/blob/master/LICENSE) file for more info.
