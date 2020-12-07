const { shell } = require('electron')
const i18n = require('format-message')

function buildHelpMenu () {
  return {
    label: i18n('Help'),
    role: 'help',
    submenu: [
      {
        label: i18n('Tutorials'),
        click: () => shell.openExternal('https://learn.plottr.com')
      }, {
        label: i18n('Demos'),
        click: () => shell.openExternal('https://plottr.com/demos/')
      }, {
        label: i18n('Documentation'),
        click: () => shell.openExternal('https://plottr.com/docs/navigating-plottr/')
      }, {
        label: i18n('Facebook Group'),
        click: () => shell.openExternal('https://www.facebook.com/groups/367650870614184')
      }, {
        type: 'separator'
      }, {
        label: i18n('Report a Problem'),
        click: () => shell.openExternal('https://plottr.com/support/')
      }, {
        type: 'separator'
      }, {
        label: i18n('Give Feedback'),
        click: () => shell.openExternal('https://feedback.getplottr.com')
      }, {
        label: i18n('Request a Feature'),
        click: () => shell.openExternal('https://plottr.com/support/?help=Feature%20Request')
      }, {
        type: 'separator'
      }, {
        label: i18n('FAQ'),
        click: () => shell.openExternal('https://plottr.com/docs/frequently-asked-questions/')
      }, {
        label: i18n('Roadmap'),
        click: () => shell.openExternal('https://plottr.com/our-roadmap')
      }
    ]
  }
}

module.exports = { buildHelpMenu }
