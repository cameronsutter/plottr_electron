import { remote, ipcRenderer } from 'electron'
import { t } from 'plottr_locales'

const win = remote.getCurrentWindow()
const { dialog } = remote

export function openExistingFile() {
  // ask user where it is
  const properties = ['openFile', 'createDirectory']
  const filters = [{ name: t('Plottr project file'), extensions: ['pltr'] }]
  const files = dialog.showOpenDialogSync(win, { filters: filters, properties: properties })
  if (files && files.length) {
    ipcRenderer.send('add-to-known-files-and-open', files[0])
  }
}
