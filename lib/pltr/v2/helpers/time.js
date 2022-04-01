export const convertFromNanosAndSeconds = (nanosAndSecondsObject) => {
  if (
    !nanosAndSecondsObject ||
    (!nanosAndSecondsObject.nanoseconds && nanosAndSecondsObject.nanoseconds !== 0) ||
    (!nanosAndSecondsObject.seconds && nanosAndSecondsObject.seconds !== 0)
  ) {
    return null
  }
  return new Date(
    nanosAndSecondsObject.seconds * 1000 + nanosAndSecondsObject.nanoseconds / 1000000
  )
}
