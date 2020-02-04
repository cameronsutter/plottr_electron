var storage = require('electron-json-storage')
const writeToEnv = require('./env')

const TRIAL_LENGTH = 30
const TRIAL_INFO_PATH = 'trial_info'

function checkTrialInfo (hasStartedCallback, hasntStartedCallback, expiredCallBack) {
  storage.has(TRIAL_INFO_PATH, function (err, hasKey) {
    if (err) log.error(err)
    if (hasKey) {
      storage.get(TRIAL_INFO_PATH, function (err, data) {
        if (err) log.error(err)
        const daysLeft = daysLeftOfTrial(data.endsAt)
        if (daysLeft <= 0) {
          expiredCallBack()
        } else {
          hasStartedCallback(daysLeft)
        }
      })
    } else {
      hasntStartedCallback()
    }
  })
}

function startTheTrial (callback) {
  turnOnTrialMode()
  const day = new Date()
  const startsAt = day.getTime()
  const end = addDays(startsAt, TRIAL_LENGTH)
  end.setUTCHours(23, 59, 59, 999)
  const endsAt = end.getTime()
  const info = {startsAt, endsAt}
  storage.set(TRIAL_INFO_PATH, info, function (err) {
    if (err) {
      log.error(err)
      rollbar.warn(err)
    }
    callback(TRIAL_LENGTH)
  })
}

function addDays (date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysLeftOfTrial (endsAt) {
  let oneDay = 24*60*60*1000
  var today = new Date()
  return Math.round((endsAt - today.getTime())/oneDay)
}

function turnOffTrialMode () {
  if (process.env.NODE_ENV !== 'dev') {
    process.env.TRIALMODE = 'false'
  }
  writeToEnv('TRIALMODE', 'false')
}

function turnOnTrialMode () {
  process.env.TRIALMODE = 'true'
  writeToEnv('TRIALMODE', 'true')
}

module.exports = { checkTrialInfo, turnOffTrialMode, startTheTrial }
