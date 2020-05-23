<template>
  <div>
    <nav class="fixed z-30 w-full border-b border-concrete flex justify-between items-center transition-colors duration-150">
      <a class="font-shadows font-bold text-2xl transition-colors duration-300 hover:text-rope block ml-5 md:ml-10 w-32" href="/">ScrollXP</a>
      <Menu :items="items" />
    </nav>
    <div class="pt-24">
      <nuxt />
    </div>
  </div>
</template>

<script>
import Menu from '../components/Menu'

export default {
  components: {
    Menu
  },
  data () {
    return {
      items: [
        {
          title: 'Parallax',
          url: '/global-parallax',
          subitems: [
            {
              title: 'Global Parallax',
              text: 'Common parallax effect. Elements move in different speeds, even when they aren\'t visible in the screen.',
              url: '/global-parallax'
            },
            {
              title: 'Scene Parallax',
              text: 'Limited parallax effect. Elements move for a <strong>limited time</strong>, defined by the scroll position.',
              url: '/'
            }
          ]
        },
        {
          title: 'Scene',
          url: '/',
          subitems: [
            {
              title: 'Common Scene',
              text: 'The most common scene.',
              url: '/'
            },
            {
              title: 'Pinned Scene',
              text: 'This scene keeps fixed in the screen for a while.',
              url: '/'
            },
            {
              title: 'Scene Modifier',
              text: 'As <strong>data-* attributes</strong> can\'t cover eveything we want to do with scenes, we can apply custom behavior to them through scene modifiers.',
              url: '/'
            }
          ]
        },
        {
          title: 'Anchors',
          url: '/'
        }
      ]
    }
  }
}
</script>

<style>
html {
  @apply font-news;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.nav-dropdown {
  animation: dropdown 200ms ease-out;
}

@keyframes dropdown {
  from {
    opacity: 50%;
    bottom: -10px;
  }
}
</style>
