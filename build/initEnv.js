var fs = require('fs')

console.log('writing env variables')
var env = {
  rollbarToken: process.env.ROLLBAR_ACCESS_TOKEN,
  trialmode: process.env.BUILD_TYPE === 'trial'
}

fs.writeFileSync('env.json', JSON.stringify(env))
