const { notarize } = require('electron-notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const start = new Date().getTime()
  console.log('notarizing')
  const appName = context.packager.appInfo.productFilename

  await notarize({
    appBundleId: 'com.plottr.app',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    ascProvider: "XUSV2KF89D"
  })

  console.log('done notarizing', new Date().getTime() - start, 'ms')
}