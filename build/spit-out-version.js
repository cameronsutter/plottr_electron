// NOTE: Run this from the root of the repo!!!
//
// It makes the current version available so that we can build for
// plottr-ci when we're in beta or alpha versions.

const fs = require('fs')

fs.writeFileSync(
  './build/version.js',
  `module.exports = {
  appVersion: '${JSON.parse(fs.readFileSync('./package.json')).version}'
}`
)
