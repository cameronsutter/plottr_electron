// Expect a string of the form: YYYY_MM?_DD? to a date.
// This is necessary because date parsing is *browser specific*!
export const parseStringDate = (stringDate) => {
  const [year, month, day] = stringDate.split('_')
  if (!year || !month || !day) {
    throw new Error(
      `Invalid date: ${stringDate}.  Expected something in the form: YYYY_MM?_DD? or YYYY-MM?-DD?`
    )
  }
  return new Date(year, month - 1, day)
}
