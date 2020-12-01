const storage = require('electron-json-storage')
const { TRIAL_INFO_PATH } = require('./config_paths')
const writeToEnv = require('./env')
const { rollbar } = require('./rollbar');
const SETTINGS = require('./settings');

const TRIAL_LENGTH = 30
const EXTENSIONS = 2
let daysLeft = 0;
let info = {}
storage.remove(TRIAL_INFO_PATH)

function checkTrialInfo (hasStartedCallback, hasntStartedCallback, expiredCallBack) {
  storage.has(TRIAL_INFO_PATH, function (err, hasKey) {
    if (err) log.error(err)
    if (hasKey) {
      storage.get(TRIAL_INFO_PATH, function (err, data) {
        if (err) log.error(err)
        info = data
        daysLeft = daysLeftOfTrial(data.endsAt)
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
  const endsAt = end.getTime()
  info = {startsAt, endsAt, extensions: EXTENSIONS}
  storage.set(TRIAL_INFO_PATH, info, function (err) {
    if (err) {
      log.error(err)
      rollbar.warn(err)
    }
    daysLeft = TRIAL_LENGTH
    callback(TRIAL_LENGTH)
  })
}

function extendTheTrial (days, callback) {
  const newEnd = addDays(info.endsAt, days)
  info = {
    ...info,
    endsAt: newEnd.getTime(),
    extensions: --info.extensions,
  }
  daysLeft = daysLeftOfTrial(newEnd);
  storage.set(TRIAL_INFO_PATH, info, callback)
}

function extendWithReset (days, callback) {
  if (info.hasBeenReset) return

  const newEnd = addDays(info.endsAt, days)
  info = {
    ...info,
    endsAt: newEnd.getTime(),
    extensions: EXTENSIONS,
    hasBeenReset: true
  }
  daysLeft = daysLeftOfTrial(newEnd);
  storage.set(TRIAL_INFO_PATH, info, callback)
}

function addDays (date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

function daysLeftOfTrial (endsAt) {
  let oneDay = 24*60*60*1000
  var today = new Date()
  return Math.round((endsAt - today.getTime())/oneDay)
}

function turnOffTrialMode () {
  SETTINGS.set('trialMode', false);
}

function turnOnTrialMode () {
  SETTINGS.set('trialMode', true);
}

function getDaysLeftInTrial() {
  return daysLeft;
}

function getTrialModeStatus() {
  return SETTINGS.get('trialMode') || false;
}

module.exports = { 
  checkTrialInfo, 
  turnOnTrialMode,
  turnOffTrialMode, 
  startTheTrial, 
  extendTheTrial, 
  extendWithReset,
  getDaysLeftInTrial,
  getTrialModeStatus,
}

