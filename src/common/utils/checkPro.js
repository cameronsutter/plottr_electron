import { PRO_ID } from './eddAPI'
import { useProInfo } from './store_hooks'

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
