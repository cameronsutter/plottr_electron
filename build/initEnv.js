var fs = require('fs')

// if (process.env.BUILD_TYPE === 'trial') {
//   console.log('TRIAL MODE detected. Writing trialmode.json')
//   var json = {trialmode: true}
//   fs.writeFileSync('trialmode.json', JSON.stringify(json))
// }

console.log('writing rollbar access token and trialmode')
var env = {
  rollbarToken: process.env.ROLLBAR_ACCESS_TOKEN,
  trialmode: process.env.BUILD_TYPE === 'trial'
}

fs.writeFileSync('env.json', JSON.stringify(env))
