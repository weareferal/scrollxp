
export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=News+Cycle:wght@400;700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, { loaders }) {
      config.module.rules = [
        {
          test: /ScrollMagic/,
          use: loaders.null()
        }
      ];
      config.resolve.alias['TweenLite'] = 'gsap/src/uncompressed/TweenLite.js';
      config.resolve.alias['TweenMax'] = 'gsap/src/uncompressed/TweenMax.js';
      config.resolve.alias['TimelineLite'] = 'gsap/src/uncompressed/TimelineLite.js';
      config.resolve.alias['TimelineMax'] = 'gsap/src/uncompressed/TimelineMax.js';
      config.resolve.alias['ScrollMagic'] = 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js';
      config.resolve.alias['animation.gsap'] = 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js';
      config.resolve.alias['debug.addIndicators'] = 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js';
    }
  }
}
