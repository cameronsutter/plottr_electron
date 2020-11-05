import fs from 'fs'
import path from 'path'
import { stringify } from 'dotenv-stringify'

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')

export default function writeToEnv (key, val) {
  const env = {
    ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    TRIALMODE: process.env.TRIALMODE,
    EDD_KEY: process.env.EDD_KEY,
    EDD_TOKEN: process.env.EDD_TOKEN,
  }
  env[key] = val
  const envstr = stringify(env)

  fs.writeFileSync(ENV_FILE_PATH, envstr)
}
