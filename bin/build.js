var packager = require('electron-packager')
var path = require('path')
var fs = require('fs')

if (process.argv[2] === 'TRIALMODE') {
  var json = {trialmode: true}
  fs.writeFileSync('trialmode.json', JSON.stringify(json))
}

var options = {
  name: 'Plottr',
  dir: path.resolve('.'),
  asar: true,
  prune: true,
  version: '1.3.2',
  icon: 'icons/pblack',
  out: path.resolve('/', 'Users', 'csutter', 'plottr_dist'),
  'app-copyright': 'Copyright 2016 C. Louis S. (Cameron Sutter)',
  'app-category-type': 'public.app-category.productivity',
  protocol: ['plottr'],
  'protocol-name': ['Plottr'],
  'extend-info': 'extend.plist',
  'extra-resource': 'icons/plottrfile.icns',
  arch: 'x64',
  platform: 'darwin',
  ignore: [
    /src/,
    /\.gitignore/,
    /.*\.(md|MD)/,
    /webpack\.config\.js/,
    /example.{0,3}\.plottr/
    /example.{0,3}\.docx/
  ]
}

// macOS
packager(options, function (errMac, appPaths) {
  if (errMac) {
    console.log('error building macOS:' + errMac, errMac.stack)
    if (process.argv[2] === 'TRIALMODE') fs.unlinkSync('trialmode.json')
  } else {
    // win64
    options.platform = 'win32'
    packager(options, function (errWin64, appPaths) {
      if (errWin64) {
        console.log('error building win64:' + errWin64)
        if (process.argv[2] === 'TRIALMODE') fs.unlinkSync('trialmode.json')
      } else {
        // win32
        options.arch = 'ia32'
        packager(options, function (errWin32, appPaths) {
          if (errWin32) console.log('error building win32:' + errWin32)
          if (process.argv[2] === 'TRIALMODE') fs.unlinkSync('trialmode.json')
        })
      }
    })
  }
})
