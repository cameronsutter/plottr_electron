import axios from 'axios'
import { PRO_ID } from './eddAPI'
import { useProInfo } from './store_hooks'

export async function userHasPro(email) {
  console.log('checking if user has pro')
  try {
    const res = await axios.post('/api/edd/subscriptions', {
      email: email,
      auth: '*otterbeartreepale*',
    })
    console.log('successful pro request')
    if (!res.data?.subscriptions) {
      console.log(res)
      return [false]
    }
    // find the subscription with Pro
    const activeSub = res.data.subscriptions.find((sub) => {
      return sub.info && isProProduct(sub.info) && isActiveSub(sub.info)
    })
    if (activeSub) {
      const { info } = activeSub
      console.log(info)
      return [true, info]
    } else {
      return [false]
    }
  } catch (error) {
    console.error(error)
    return [false]
  }
}

function isProProduct(info) {
  return info.product_id == PRO_ID
}

function isActiveSub(info) {
  return info.status == 'active'
}

export const useProLicenseInfo = () => {
  const [info, size, setAtKey, setAll] = useProInfo()

  if (size) {
    const usableInfo = {
      ...info,
      customer_email: info.customer.email,
      expires: info.beta ? 'lifetime' : info.expiration,
      licenseKey: info.beta ? 'Plottr Web Beta' : 'Plottr Pro',
    }
    console.log('usable SubInfo', usableInfo)
    return [usableInfo, Object.keys(usableInfo).length, setAtKey, setAll]
  } else {
    return [info, size, setAtKey, setAll]
  }
}
