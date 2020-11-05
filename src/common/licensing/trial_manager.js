import { useTrialInfo } from '../utils/store_hooks'

const TRIAL_LENGTH = 30
const EXTENSIONS = 2

export function useTrialStatus () {
  const [trialInfo, trialInfoSize, setTrialInfo] = useTrialInfo()

  const startTrial = () => {
    const day = new Date()
    const startsAt = day.getTime()
    const end = addDays(startsAt, TRIAL_LENGTH)
    const endsAt = end.getTime()
    setTrialInfo({startsAt, endsAt, extensions: EXTENSIONS})
  }

  const extendTrial = (days) => {
    const newEnd = addDays(trailInfo.endsAt, days)
    const info = {
      ...trailInfo,
      endsAt: newEnd.getTime(),
      extensions: --info.extensions,
    }
    setTrialInfo(info)
  }

  const extendWithReset = (days) => {
    if (trailInfo.hasBeenReset) return

    const newEnd = addDays(trailInfo.endsAt, days)
    const info = {
      ...trailInfo,
      endsAt: newEnd.getTime(),
      extensions: EXTENSIONS,
      hasBeenReset: true
    }
    setTrialInfo(info)
  }

  if (!trialInfoSize) return {started: false, startTrial}

  const daysLeft = daysLeftOfTrial(trialInfo.endsAt)
  const expired = daysLeft <= 0
  const canExtend = trialInfo.extensions > 0

  return {started: true, daysLeft, expired, canExtend, extendTrial, extendWithReset}
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
