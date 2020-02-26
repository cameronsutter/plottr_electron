const fs = require('fs')
const path = require('path')
const { stringify } = require('dotenv-stringify')

const ENV_FILE_PATH = path.resolve(__dirname, '..', '..', '.env')

function writeToEnv (key, val) {
  const env = {
    ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    TRIALMODE: process.env.TRIALMODE,
    EDD_KEY: process.env.EDD_KEY,
    EDD_TOKEN: process.env.EDD_TOKEN,
    useEDD: process.env.useEDD,
  }
  env[key] = val
  const envstr = stringify(env)

  fs.writeFileSync(ENV_FILE_PATH, envstr)
}

module.exports = writeToEnv