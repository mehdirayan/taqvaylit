// tailwind.config.js
export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
    './node_modules/@ionic/vue/**/*.{js,vue}' // 👈 pour Ionic
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
