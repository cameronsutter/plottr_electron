var fs = require('fs')
var { stringify } = require('dotenv-stringify')
var path = require('path')

console.log('writing env variables')
var env = {
  ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
  EDD_KEY: process.env.EDD_KEY,
  EDD_TOKEN: process.env.EDD_TOKEN,
  useEDD: false,
  TRIALMODE: false,
  NODE_ENV: 'production', // i'm pretty sure this is useless. I think it gets set by webpack
}
var envstr = stringify(env)

fs.writeFileSync('.env', envstr)
