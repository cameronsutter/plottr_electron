export const WINDOWS = 'WINDOWS'
export const LINUX = 'LINUX'
export const MACOS = 'MACOS'

const ALL_OSES = [WINDOWS, LINUX, MACOS]

const isOS = () => {
  let os = null

  const setOS = (osToSet) => {
    if (ALL_OSES.indexOf(osToSet) === -1) {
      throw new Error(`Invalid operating system: ${osToSet}.  Must be one of: ${ALL_OSES}`)
    }
    os = osToSet
  }

  const checkOS = () => {
    if (os === null) {
      throw new Error('Window not told what OS the app is running on.')
    }
  }

  const isWindows = () => {
    checkOS()
    return os === WINDOWS
  }

  const isLinux = () => {
    checkOS()
    return os === LINUX
  }

  const isMacOS = () => {
    checkOS()
    return os === MACOS
  }

  return { setOS, isWindows, isLinux, isMacOS }
}

const { setOS, isWindows, isLinux, isMacOS } = isOS()

export { setOS, isWindows, isLinux, isMacOS }
