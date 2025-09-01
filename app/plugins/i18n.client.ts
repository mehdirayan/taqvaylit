import { createI18n } from 'vue-i18n'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Default locale
  const defaultLocale:string = 'dz'

  // Load messages dynamically
  const loadLocaleMessages = async (locale: string) => {
    try {
      const messages = await import(`../i18n/locales/${locale}.json`)
       
      return messages.default
    } catch (err) {
      console.warn(`[i18n] Missing locale file: ${locale}`, err)
      return {}
    }
  }

  // Preload default messages
  const messages = {
    [defaultLocale]: await loadLocaleMessages(defaultLocale)
  }

  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages
  })

  nuxtApp.vueApp.use(i18n)
  nuxtApp.provide('i18n', i18n)

  // Lazy load function
  nuxtApp.provide('setLocale', async (locale: string) => {
    const newMessages = await loadLocaleMessages(locale)
    i18n.global.setLocaleMessage(locale, newMessages)
    i18n.global.locale.value = locale
  })



})
