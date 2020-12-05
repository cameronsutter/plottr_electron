const { shell } = require('electron')
const i18n = require('format-message')
const SETTINGS = require('../settings')
const { reloadWindow, windows } = require('../windows')
const createErrorReport = require('../error_report')
const enterCustomerServiceCode = require('../customer_service_codes')
const { getLicenseInfo } = require('../license_info')

const USER_INFO = getLicenseInfo()

function buildHelpMenu () {
  return {
    label: i18n('Help'),
    role: 'help',
    submenu: [
      {
        label: i18n('View the Tour'),
        visible: false,
        click: () => {
          SETTINGS.set('showTheTour', true)
          reloadWindow()
        }
      }, {
        label: i18n('Documentation'),
        click: () => shell.openExternal('https://getplottr.com/docs/navigating-plottr/')
      }, {
        label: i18n('Facebook Group'),
        click: () => shell.openExternal('https://www.facebook.com/groups/367650870614184')
      }, {
        type: 'separator'
      }, {
        label: i18n('Report a Problem'),
        click: () => shell.openExternal('https://getplottr.com/support/')
      }, {
        label: i18n('Create an Error Report'),
        sublabel: i18n('Creates a report to send me'),
        click: () => createErrorReport(USER_INFO, windows.map(w => w.state))
      }, {
        label: i18n('Enter a Customer Service Code'),
        click: enterCustomerServiceCode
      }, {
        type: 'separator'
      }, {
        label: i18n('Give Feedback'),
        click: () => shell.openExternal('https://feedback.getplottr.com')
      }, {
        label: i18n('Request a Feature'),
        click: () => shell.openExternal('https://getplottr.com/support/?help=Feature%20Request')
      }, {
        type: 'separator'
      }, {
        label: i18n('FAQ'),
        click: () => shell.openExternal('https://getplottr.com/docs/frequently-asked-questions/')
      }, {
        label: i18n('Roadmap'),
        click: () => shell.openExternal('https://roadmap.getplottr.com')
      }
    ]
  }
}

module.exports = { buildHelpMenu }
