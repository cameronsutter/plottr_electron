module.exports = {
  TRIAL_MODE: process.env.TRIALMODE === 'true',
  NODE_ENV: process.env.NODE_ENV,
  ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN || ''
}
