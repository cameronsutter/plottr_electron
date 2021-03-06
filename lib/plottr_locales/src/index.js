const i18n = require('format-message')
const { app, remote } = require('electron')

const locales = {
  en: require('./en.json'),
  fr: require('./fr.json'),
  es: require('./es.json'),
  flipped: require('./flipped.json'),
}

const localeNames = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
}

// The purpose of the flipped locale is to easily see if there are any strings
// in the ui that have not been wrapped in `i18n()`
if (process.env.NODE_ENV === 'dev') {
  localeNames.flipped = 'Flipped'
}

function setupI18n(settings) {
  i18n.setup({
    translations: locales,
    locale: getCurrentLocale(settings),
    missingTranslation: 'ignore',
    formats: {
      date: {
        monthDay: { month: 'short', day: 'numeric' },
      },
    },
  })
}

function getCurrentLocale(settings) {
  const userSetLocale = settings ? settings.get('locale') : null
  const appFRD = app || (remote && remote.app)

  return userSetLocale || appFRD.getLocale() || 'en'
}

module.exports = {
  locales,
  localeNames,
  setupI18n,
  getCurrentLocale,
  t: i18n,
}
