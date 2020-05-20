<template>
  <ul class="hidden lg:flex">
    <li v-for="item in items" :key="item.title" class="group relative">
      <a class="block font-bold uppercase tracking-widest px-8 py-6 border-b border-transparent transition-colors duration-200 group-hover:border-black" :href="item.url">
        {{ item.title }}
      </a>
      <ul v-if="item.subitems && item.subitems.length" class="nav-dropdown border border-black bg-white text-black rounded-md w-80 overflow-hidden absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2 hidden shadow-sm group-hover:block group-focus-within:block">
        <template v-for="subitem in item.subitems">
          <li :key="subitem.title">
            <a class="block p-8 transition-colors duration-200 hover:bg-rope hover:text-white" :href="subitem.url">
              <div class="font-bold mb-2">{{ subitem.title }}</div>
              <div class="text-sm" v-html="subitem.text"></div>
            </a>
          </li>
          <li :key="subitem.title" class="last:hidden">
            <hr class="h-px border-none bg-concrete mx-8">
          </li>
        </template>
      </ul>
    </li>
    <li>
      <a class="bg-black hover:bg-rope transition-colors duration-300 font-bold text-white border-b border-transparent block uppercase tracking-widest px-8 py-6" href="https://github.com/weareferal/scrollxp" title="Go to GitHub">GitHub repo</a>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default () {
        return []
      }
    }
  }
}
</script>

<style>

</style>
