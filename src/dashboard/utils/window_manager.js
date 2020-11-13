import Store from 'electron-store'
import windowStateKeeper from 'electron-window-state'
import { KNOWN_FILES_PATH } from '../../common/utils/config_paths'
import { remote, screen } from 'electron'
const win = remote.getCurrentWindow()
const dialog = remote.dialog

const knownFilesPath = process.env.NODE_ENV == 'development' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH
const knownFilesStore = new Store({name: knownFilesPath, watch: true})
let windows = {}

export function openKnownFile (filePath, id) {
  console.log('filePath', filePath)

  open

  if (id) {
    // update lastOpen
    knownFilesStore.set(`${id}.lastOpened`, Date.now())
  }
}

export function openExistingFile () {
  // ask user where it is
  const properties = [ 'openFile', 'createDirectory' ]
  const filters = [{name: 'Plottr file', extensions: ['pltr']}]
  const files = dialog.showOpenDialogSync({ filters: filters, properties: properties })
  if (files && files.length) {
    const id = addToKnown(files[0])
    openKnownFile(files[0], id)
  }
}

export function createNew (templateData) {

}

function addToKnown (filePath) {
  const existingId = Object.keys(knownFilesStore.store).find(id => knownFilesStore.store[id].path == filePath)
  if (existingId) {
    return existingId
  } else {
    const newId = knownFilesStore.size + 1
    knownFilesStore.set(`${newId}`, {
      path: filePath,
      lastOpened: Date.now()
    })
    return newId
  }

}

// TODO:
// - backup manager
// - fs
// - BrowserWindow
// - path
// - dontquit ?
// - closing the window, but not trying to quit
// - SETTINGS
// - FileManager.open
// - UpdateManager
// - etc

function openWindow (filePath, jsonData) {
  // Load the previous state with fallback to defaults
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // replacing makes it so it doesn't create the folder structure
  let stateKeeprFile = fileName.replace(/[\/\\]/g, '~')
  const numFileLetters = 100

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * 0.9),
    defaultHeight: parseInt(height * 0.9),
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: stateKeeprFile.slice(-numFileLetters),
  })

  // Create the browser window.
  let newWindow = new BrowserWindow({
    x: stateKeeper.x,
    y: stateKeeper.y,
    width: stateKeeper.width,
    height: stateKeeper.height,
    fullscreen: stateKeeper.isFullScreen || null,
    show: false,
    backgroundColor: '#f7f7f7',
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true,
      enableRemoteModule: true,
    }
  })

  // register listeners on the window
  stateKeeper.manage(newWindow)

  // and load the app.html of the app.
  const entryFile = path.join(filePrefix, 'app.html')
  newWindow.loadURL(entryFile)


  newWindow.once('ready-to-show', function() {
    this.show()
  })

  // at this point, verification will always be done
  dontquit = false

  newWindow.webContents.on('did-finish-load', () => {
    // launch wouldn't be sent if they have another file open
    if (!launchSent) {
      newWindow.webContents.send('send-launch', app.getVersion(), TRIALMODE, DAYS_LEFT)
    }
  })

  newWindow.webContents.on('unresponsive', () => {
    log.warn('webContents became unresponsive')
    newWindow.webContents.reload()
  })

  newWindow.on('unresponsive', () => {
    log.warn('window became unresponsive')
    newWindow.webContents.reload()
  })

  if (process.env.NODE_ENV === 'dev' || SETTINGS.get('forceDevTools')) {
    newWindow.openDevTools()
  }

  newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    var win = windows.find(w => w.id == this.id) // depends on 'this' being the window

    // closing the window, but not trying to quit
    // only remove from open windows if there's more than one window open
    if (!tryingToQuit && windows.length > 1 && win) {
      FileManager.close(win.fileName)
    }

    if (win && win.state && isDirty(win.state, win.lastSave)) {
      e.preventDefault()
      var _this = this
      askToSave(this, win.state, win.fileName, function() {
        dereferenceWindow(win)
        if (tryingToQuit) app.quit()
        _this.destroy()
      })
    } else {
      dereferenceWindow(win)
    }
  })

  newWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  try {
    let json = jsonData ? jsonData : JSON.parse(fs.readFileSync(fileName, 'utf-8'))
    app.addRecentDocument(fileName)
    FileManager.open(fileName)
    backupFile(fileName, json, (err) => {
      if (err) {
        log.warn('[file open backup]', err)
        rollbar.error({message: 'BACKUP failed'})
        rollbar.warn(err, {fileName: fileName})
      } else {
        log.info('[file open backup]', 'success', fileName)
      }
    })

    windows.push({
      id: newWindow.id,
      window: newWindow,
      fileName: fileName,
      state: json,
      lastSave: json,
      importFrom,
    })
    UpdateManager.updateWindows(windows)
    newWindow.setTitle(displayFileName(fileName))
    newWindow.setRepresentedFilename(fileName)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {fileName: fileName})
    FileManager.close(fileName)
    newWindow.destroy()
  }
}

