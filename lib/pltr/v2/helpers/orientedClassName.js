export function orientedClassName(name, orientation) {
  if (orientation === 'horizontal') return name
  else return `vertical-${name}`
}
