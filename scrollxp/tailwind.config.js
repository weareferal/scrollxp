/*
** TailwindCSS Configuration File
**
** Docs: https://tailwindcss.com/docs/configuration
** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
*/
module.exports = {
  theme: {
    extend: {
      colors: {
        "black": "#000000",
        "mine-shaft": "#323232",
        "gray": "#8C8C8C",
        "quill-gray": "#d9d8d6",
        "concrete": "#f3f3f3",
        "spring-wood": "#fbfaf8",
        "white": "#ffffff",
        "old-gold": "#cc9d39",
        "rope": "#875a1a"
      },
      inset: {
        "1/2": "50%",
      },
      width: {
        "80": "20rem"
      },
      fontFamily: {
        shadows: ["Shadows Into Light", "Helvetica Neue", "Arial", "sans-serif"],
        news: ["News Cycle", "Helvetica Neue", "Arial", "sans-serif"]
      },
    }
  },
  variants: {
    display: ["responsive", "group-hover", "last"],
    textColor: ["responsive", "hover", "group-hover"],
    borderColor: ["responsive", "hover", "group-hover"],
  },
  plugins: []
}
