var packager = require('electron-packager')
var path = require('path')

var options = {
  name: 'Plottr',
  dir: path.resolve('.'),
  asar: true,
  prune: true,
  version: '1.3.2',
  icon: 'icons/pblack',
  out: path.resolve('/', 'Users', 'csutter', 'plottr_dist'),
  protocol: ['plottr'],
  'app-copyright': 'Copyright 2016 C. Louis S. (Cameron Sutter)',
  'app-category-type': 'public.app-category.productivity',
  'protocol-name': ['Plottr'],
  arch: 'x64',
  platform: 'darwin',
  ignore: [
    /src/,
    /\.gitignore/,
    /.*\.(md|MD)/,
    /webpack\.config\.js/
  ]
}

// macOS
packager(options, function (errMac, appPaths) {
  if (errMac) console.log('error building macOS:' + errMac, errMac.stack)
  else {
    // win64
    options.platform = 'win32'
    packager(options, function (errWin64, appPaths) {
      if (errWin64) console.log('error building win64:' + errWin64)
      else {
        // win32
        options.arch = 'ia32'
        packager(options, function (errWin32, appPaths) {
          if (errWin32) console.log('error building win32:' + errWin32)
        })
      }
    })
  }
})
