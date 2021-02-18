import { useTrialInfo, trialStore } from '../utils/store_hooks'

const TRIAL_LENGTH = 30
const EXTENSIONS = 2

export function useTrialStatus() {
  const [trialInfo, trialInfoSize, _, setTrialInfo] = useTrialInfo()

  const startTrial = () => {
    const day = new Date()
    const startsAt = day.getTime()
    const end = addDays(startsAt, TRIAL_LENGTH)
    const endsAt = end.getTime()
    setTrialInfo({ startsAt, endsAt, extensions: EXTENSIONS })
  }

  const extendTrial = (days) => {
    const newEnd = addDays(trialInfo.startsAt, days)
    const info = {
      ...trialInfo,
      endsAt: newEnd.getTime(),
      extensions: --trialInfo.extensions,
    }
    setTrialInfo(info)
  }

  if (!trialInfoSize) return { started: false, startTrial }

  const daysLeft = daysLeftOfTrial(trialInfo.endsAt)
  const expired = daysLeft <= 0
  const canExtend = trialInfo.extensions > 0

  return {
    started: true,
    daysLeft,
    expired,
    canExtend,
    startedOn: trialInfo.startsAt,
    endsOn: trialInfo.endsAt,
    extendTrial,
  }
}

// this is needed outside the context of a hook
export function extendTrialWithReset(days) {
  const currentInfo = trialStore.store
  if (currentInfo.hasBeenReset) return

  const newEnd = addDays(currentInfo.endsAt, days)
  trialStore.set('endsAt', newEnd.getTime())
  trialStore.set('extensions', EXTENSIONS)
  trialStore.set('hasBeenReset', true)
}

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

function daysLeftOfTrial(endsAt) {
  let oneDay = 24 * 60 * 60 * 1000
  var today = new Date()
  return Math.round((endsAt - today.getTime()) / oneDay)
}
