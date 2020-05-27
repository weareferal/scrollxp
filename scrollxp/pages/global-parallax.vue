<template>
  <div class="container" data-scene>
    <div class="flex flex-col">
      <div class="w-24 h-24 border-2 border-black" data-parallax data-parallax-speed="2" data-parallax-momentum="0"></div>
    </div>
    <div class="h-screen">a</div>
    <div class="h-screen">b</div>
  </div>
</template>

<script>
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config.js'
let ScrollView
if (process.client) {
  ScrollView = require('../lib/scroll-view').default
}

export default {
  mounted () {
    this.view = new ScrollView({
      container: document.body,
      smoothScrolling: false,
      breakpoints: this._getBreakpoints()
    })
  },
  methods: {
    _getBreakpoints () {
      const fullConfig = resolveConfig(tailwindConfig)

      const json = {}

      Object.keys(fullConfig.theme.screens).forEach((key) => {
        json[key] = parseInt(fullConfig.theme.screens[key])
      })

      return json
    }
  }
}
</script>

<style>

</style>
