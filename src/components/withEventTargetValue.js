export const withEventTargetValue = (fn) => (event) => {
  return fn(event.target.value)
}
