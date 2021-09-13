export function checkDependencies(args) {
  Object.entries(args).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      throw new Error(`${key} is required, but got ${value}`)
    }
  })
}
