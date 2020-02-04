// SOMEDAY


// const { app, BrowserWindow, Menu, dialog } = require('electron')
// const i18n = require('format-message')

// export function loadMenu () {
//   const template = buildMenu()
//   const appMenu = Menu.buildFromTemplate(template)
//   Menu.setApplicationMenu(appMenu)
// }

// function buildMenu () {
//   return [
//     buildPlottrMenu(),
//     buildFileMenu(),
//     buildEditMenu(),
//     buildViewMenu(),
//     buildWindowMenu(),
//     buildHelpMenu()
//   ]
// }

// function buildPlottrMenu () {
//   var submenu = [{
//     label: i18n('About Plottr'),
//     click: openAboutWindow,
//   }]
//   if (TRIALMODE) {
//     submenu = [].concat(submenu, {
//       type: 'separator',
//     }, {
//       label: i18n('{days} days remaining', {days: DAYS_LEFT}),
//       enabled: false,
//     }, {
//       label: i18n('Buy the Full Version') + '...',
//       click: openBuyWindow,
//     }, {
//       label: i18n('Enter License') + '...',
//       click: openVerifyWindow,
//     }, {
//       type: 'separator',
//     })
//   }
//   if (process.platform === 'darwin') {
//     submenu = [].concat(submenu, {
//       type: 'separator'
//     }, {
//       label: i18n('Hide Plottr'),
//       accelerator: 'Command+H',
//       role: 'hide'
//     }, {
//       label: i18n('Hide Others'),
//       accelerator: 'Command+Alt+H',
//       role: 'hideothers'
//     }, {
//       label: i18n('Show All'),
//       role: 'unhide'
//     }, {
//       type: 'separator'
//     }, {
//       label: i18n('Quit'),
//       accelerator: 'Cmd+Q',
//       click: function () {
//         tryingToQuit = true
//         app.quit()
//       }
//     })
//   } else {
//     submenu = [].concat(submenu, {
//       label: i18n('Close'),
//       accelerator: 'Alt+F4',
//       click: function () {
//         tryingToQuit = true
//         app.quit()
//       }
//     })
//   }
//   return {
//     label: 'Plottr',
//     submenu: submenu
//   }
// }

// function buildFileMenu () {
//   var submenu = [{
//     label: i18n('Close'),
//     accelerator: 'CmdOrCtrl+W',
//     click: function () {
//       let win = BrowserWindow.getFocusedWindow()
//       if (win) {
//         let winObj = _.find(windows, {id: win.id})
//         if (winObj) {
//           if (process.env.NODE_ENV !== 'dev') {
//             if (checkDirty(winObj.state, winObj.lastSave)) {
//               askToSave(win, winObj.state, winObj.fileName, function () { closeWindow(win.id) })
//             } else {
//               closeWindow(win.id)
//             }
//           } else {
//             closeWindow(win.id)
//           }
//         } else {
//           win.close()
//         }
//       }
//     }
//   }]
//   var submenu = [].concat({
//     label: i18n('New') + '...',
//     enabled: !TRIALMODE,
//     accelerator: 'CmdOrCtrl+N',
//     click: askToCreateFile
//   }, {
//     label: i18n('Open') + '...',
//     enabled: !TRIALMODE,
//     accelerator: 'CmdOrCtrl+O',
//     click: askToOpenFile
//   }, {
//     type: 'separator'
//   }, {
//     label: i18n('Save'),
//     accelerator: 'CmdOrCtrl+S',
//     click: function () {
//       let win = BrowserWindow.getFocusedWindow()
//       let winObj = _.find(windows, {id: win.id})
//       if (winObj) {
//         saveFile(winObj.state.file.fileName, winObj.state, function (err) {
//           if (err) {
//             log.warn(err)
//             log.warn('file name: ' + winObj.state.file.fileName)
//             rollbar.warn(err, {fileName: winObj.state.file.fileName})
//             gracefullyNotSave()
//           } else {
//             win.webContents.send('state-saved')
//             winObj.lastSave = winObj.state
//             win.setDocumentEdited(false)
//           }
//         })
//       }
//     }
//   }, {
//     label: i18n('Save as') + '...',
//     enabled: !TRIALMODE,
//     accelerator: 'CmdOrCtrl+Shift+S',
//     click: function () {
//       let win = BrowserWindow.getFocusedWindow()
//       let winObj = _.find(windows, {id: win.id})
//       if (winObj) {
//         dialog.showSaveDialog(win, {title: i18n('Where would you like to save this copy?')}, function (fileName) {
//           if (fileName) {
//             var fullName = fileName + '.pltr'
//             saveFile(fullName, winObj.state, function (err) {
//               if (err) {
//                 log.warn(err)
//                 log.warn('file name: ' + fullName)
//                 rollbar.warn(err, {fileName: fullName})
//                 gracefullyNotSave()
//               } else {
//                 app.addRecentDocument(fullName)
//               }
//             })
//           }
//         })
//       }
//     }
//   },
//   submenu)
//   return {
//     label: i18n('File'),
//     submenu: submenu
//   }
// }

// function buildEditMenu () {
//   return {
//     label: i18n('Edit'),
//     submenu: [{
//       label: 'Cut',
//       accelerator: 'CmdOrCtrl+X',
//       role: 'cut'
//     }, {
//       label: i18n('Copy'),
//       accelerator: 'CmdOrCtrl+C',
//       role: 'copy'
//     }, {
//       label: i18n('Paste'),
//       accelerator: 'CmdOrCtrl+V',
//       role: 'paste'
//     }, {
//       type: 'separator'
//     }, {
//       label: i18n('Select All'),
//       accelerator: 'CmdOrCtrl+A',
//       role: 'selectall'
//     }]
//   }
// }

// function buildViewMenu () {
//   var submenu = [{
//     label: i18n('Reload'),
//     accelerator: 'CmdOrCtrl+R',
//     click: function () {
//       let win = BrowserWindow.getFocusedWindow()
//       let winObj = _.find(windows, {id: win.id})
//       if (process.env.NODE_ENV !== 'dev') {
//         if (checkDirty(winObj.state, winObj.lastSave)) {
//           askToSave(win, winObj.state, winObj.fileName, win.webContents.reload)
//         } else {
//           win.webContents.reload()
//         }
//       } else {
//         win.webContents.reload()
//       }
//     }
//   }, {
//       label: i18n('Dark Mode'),
//       accelerator: 'CmdOrCtrl+D',
//       checked: darkMode,
//       type: 'checkbox',
//       click: function () {
//         darkMode = !darkMode
//         windows.forEach(function (w) {
//           w.window.webContents.send('set-dark-mode', darkMode)
//         })
//       }
//   }, {
//     label: i18n('Take Screenshot') + '...',
//     accelerator: 'CmdOrCtrl+P',
//     click: takeScreenshot
//   }]
//   if (process.env.NODE_ENV === 'dev') {
//     submenu.push({
//       label: 'View Verify Window',
//       click: openVerifyWindow
//     })
//   }
//   return {
//     label: i18n('View'),
//     submenu: submenu
//   }
// }

// function buildWindowMenu () {
//   return {
//     label: i18n('Window'),
//     role: 'window',
//     submenu: [
//       {
//         label: i18n('Minimize'),
//         accelerator: 'CmdOrCtrl+M',
//         role: 'minimize'
//       }, {
//         type: 'separator'
//       }, {
//         label: i18n('Bring All to Front'),
//         role: 'front'
//       }
//     ]
//   }
// }

// function buildHelpMenu () {
//   return {
//     label: i18n('Help'),
//     role: 'help',
//     submenu: [
//       {
//         label: i18n('Report a Problem') + '...',
//         sublabel: i18n('Creates a report to send me'),
//         click: function () {
//           let report = prepareErrorReport()
//           sendErrorReport(report)
//         }
//       },
//       {
//         label: i18n('Give feedback') + '...',
//         click: function () {
//           openReportWindow('http://plottr.freshdesk.com/support/tickets/new')
//         }
//       },
//       {
//         label: i18n('Request a feature') + '...',
//         click: function () {
//           openReportWindow('http://plottr.freshdesk.com/support/tickets/new')
//         }
//       },
//       {
//         label: i18n('FAQ') + '...',
//         click: function () {
//           openReportWindow('http://plottr.freshdesk.com/support/solutions')
//         }
//       },
//     ]
//   }
// }