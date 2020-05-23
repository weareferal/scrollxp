<template>
  <div class="container">
    <div class="flex flex-col">
      <div class="w-24 h-24 border-2 border-black"></div>
    </div>
    <div class="h-screen">a</div>
    <div class="h-screen">b</div>
  </div>
</template>

<script>
import resolveConfig from 'tailwindcss/resolveConfig'
import ScrollView from '../lib/scroll-view'
import tailwindConfig from '../tailwind.config.js'

export default {
  mounted () {
    const fullConfig = resolveConfig(tailwindConfig)

    this.view = new ScrollView({
      container: document.body,
      smoothScrolling: false,
      breakpoints: fullConfig.theme.screens
    })
  }
}
</script>

<style>

</style>
