const { shell, ipcRenderer } = require('electron')
const { t } = require('plottr_locales')

function buildHelpMenu() {
  return {
    label: t('Help'),
    role: 'help',
    submenu: [
      {
        label: t('Tutorials'),
        click: () => shell.openExternal('https://learn.plottr.com'),
      },
      {
        label: t('Demos'),
        click: () => shell.openExternal('https://plottr.com/demos/'),
      },
      {
        label: t('Guided Tours'),
        submenu: [
          {
            label: t('Act Structure'),
            click: function (event, focusedWindow) {
              focusedWindow.webContents.send('acts-tour-start')
            },
          },
        ],
      },
      {
        label: t('Documentation'),
        click: () => shell.openExternal('https://docs.plottr.com'),
      },
      {
        label: t('Facebook Group'),
        click: () => shell.openExternal('https://www.facebook.com/groups/367650870614184'),
      },
      {
        type: 'separator',
      },
      {
        label: t('Report a Problem'),
        click: () =>
          shell.openExternal('https://docs.plottr.com/submit-a-ticket?help=Technical%20Support'),
      },
      {
        label: t('Create an Error Report'),
        click: (event, focusedWindow) =>
          focusedWindow.webContents.send('create-error-report', null, true),
      },
      {
        type: 'separator',
      },
      {
        label: t('Give Feedback'),
        click: () => shell.openExternal('https://feedback.getplottr.com'),
      },
      {
        label: t('Request a Feature'),
        click: () =>
          shell.openExternal('https://docs.plottr.com/submit-a-ticket?help=Feature%20Request'),
      },
      {
        type: 'separator',
      },
      {
        label: t('FAQ'),
        click: () => shell.openExternal('https://docs.plottr.com/frequently-asked-questions'),
      },
      {
        label: t('Roadmap'),
        click: () => shell.openExternal('https://plottr.com/our-roadmap'),
      },
    ],
  }
}

module.exports = { buildHelpMenu }
