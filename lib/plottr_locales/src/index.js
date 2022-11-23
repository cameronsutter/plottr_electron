const i18n = require('format-message')

const locales = {
  en: require('./en.json'),
  de: require('./de.json'),
  fr: require('./fr.json'),
  es: require('./es.json'),
  fa: require('./fa.json'),
  ru: require('./ru.json'),
  it: require('./it.json'),
  pt: require('./pt.json'),
  el: require('./el.json'),
  flipped: require('./flipped.json'),
}

const localeNames = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  el: 'Ελληνικά',
  fr: 'Français',
  it: 'Italiana',
  pt: 'português',
  fa: 'فارسی',
  ru: 'русский язык',
}

// The purpose of the flipped locale is to easily see if there are any strings
// in the ui that have not been wrapped in `i18n()`
if (process.env.NODE_ENV === 'dev') {
  localeNames.flipped = 'Flipped'
}

function setupI18n(settings, platform) {
  i18n.setup({
    translations: locales,
    locale: getCurrentLocale(settings, platform),
    missingTranslation: 'ignore',
    formats: {
      date: {
        monthDay: { month: 'short', day: 'numeric' },
      },
    },
  })
}

function getCurrentLocale(settings, platform) {
  const userSetLocale = settings ? settings.locale : null

  return userSetLocale || platform?.locale || 'en'
}

module.exports = {
  locales,
  localeNames,
  setupI18n,
  getCurrentLocale,
  t: i18n,
}
