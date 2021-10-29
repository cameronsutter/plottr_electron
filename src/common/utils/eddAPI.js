export const PRO_ID = '104900'
export const EDD_BASE_URL = 'https://my.plottr.com/edd-api'

// NOTE: only needed for non-license api calls
export function apiURL(path = '', params = '') {
  const authParams = `?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}`
  return `${EDD_BASE_URL}/${path}/${authParams}&number=-1${params}`
}

export function subscriptionsURL(email) {
  return apiURL('subscriptions', `&customer=${email}`)
}
