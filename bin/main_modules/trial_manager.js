const Store = require('electron-store')
const { TRIAL_INFO_PATH } = require('./config_paths')
const trialInfo = new Store({name: TRIAL_INFO_PATH})
const SETTINGS = require('./settings')

const TRIAL_LENGTH = 30
const EXTENSIONS = 2
let daysLeft = 0

function checkTrialInfo (hasStartedCallback, hasntStartedCallback, expiredCallBack) {
  if (trialInfo.size) {
    // has started
    daysLeft = daysLeftOfTrial(trialInfo.get('endsAt'))
    if (daysLeft <= 0) {
      expiredCallBack()
    } else {
      hasStartedCallback(daysLeft)
    }
  } else {
    // hasn't started
    hasntStartedCallback()
  }
}

function startTheTrial (callback) {
  turnOnTrialMode()
  const day = new Date()
  const startsAt = day.getTime()
  const end = addDays(startsAt, TRIAL_LENGTH)
  const endsAt = end.getTime()

  trialInfo.set('startsAt', startsAt)
  trialInfo.set('endsAt', endsAt)
  trialInfo.set('extensions', EXTENSIONS)

  daysLeft = TRIAL_LENGTH
  callback(TRIAL_LENGTH)
}

function extendTheTrial (days, callback) {
  const newEnd = addDays(trialInfo.get('endsAt'), days)

  trialInfo.set('endsAt', newEnd.getTime())
  trialInfo.set('extensions', --trialInfo.get('extensions'))

  daysLeft = daysLeftOfTrial(newEnd)
  callback()
}

function extendWithReset (days, callback) {
  if (trialInfo.get('hasBeenReset')) return

  const newEnd = addDays(trialInfo.get('endsAt'), days)

  trialInfo.set('endsAt', newEnd.getTime())
  trialInfo.set('extensions', EXTENSIONS)
  trialInfo.set('hasBeenReset', true)

  daysLeft = daysLeftOfTrial(newEnd)
  callback()
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
  SETTINGS.set('trialMode', false)
}

function turnOnTrialMode () {
  SETTINGS.set('trialMode', true)
}

function getDaysLeftInTrial() {
  return daysLeft
}

function getTrialModeStatus() {
  return SETTINGS.get('trialMode') || false
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

