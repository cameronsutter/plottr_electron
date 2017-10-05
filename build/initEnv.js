var fs = require('fs')

// if (process.env.BUILD_TYPE === 'trial') {
//   console.log('TRIAL MODE detected. Writing trialmode.json')
//   var json = {trialmode: true}
//   fs.writeFileSync('trialmode.json', JSON.stringify(json))
// }

console.log('writing rollbar access token and trialmode')
var env = {
  ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
  TRIALMODE: process.env.BUILD_TYPE === 'trial'
}

fs.writeFileSync('.env', JSON.stringify(env))
