import React from 'react'
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}
import { SETTINGS } from '../file-system/stores'

const electron = require('electron')
const { setupI18n } = require('plottr_locales')
setupI18n(SETTINGS, { electron })
;(() => {
  require('./_index.js')
})()
