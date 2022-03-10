export const convertFromNanosAndSeconds = (nanosAndSecondsObject) => {
  if (
    !nanosAndSecondsObject ||
    !nanosAndSecondsObject.nanoseconds ||
    !nanosAndSecondsObject.seconds
  ) {
    return null
  }
  return new Date(
    nanosAndSecondsObject.seconds * 1000 + nanosAndSecondsObject.nanoseconds / 1000000
  )
}
