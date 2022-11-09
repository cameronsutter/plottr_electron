import { shell } from 'electron'
import { t } from 'plottr_locales'

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
              focusedWindow.webContents.send('turn-on-acts-help')
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
        label: t('Contact Support'),
        click: () => shell.openExternal('https://plottr.com/support'),
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
        label: t('Links'),
        click: () => shell.openExternal('https://feedback.getplottr.com'),
      },
      {
        label: t('Request a Feature'),
        click: () => shell.openExternal('https://plottr.com/support'),
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

export { buildHelpMenu }
