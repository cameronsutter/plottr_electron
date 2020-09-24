import { uniq } from 'lodash'

let usableFonts = ['Forum', 'IBM Plex Serif', 'Lato', 'Yellowtail']
let recentlyUsed = ['Forum']

export function setFonts (fonts) {
  usableFonts = fonts.reduce((acc, f) => {
    acc.push(f.replace(/"/g, ''))
    return acc
  }, usableFonts)
  usableFonts = uniq(usableFonts).sort()
}

export function getFonts () {
  return usableFonts
}

export function getRecent () {
  return recentlyUsed
}

export function addRecent (name) {
  if (recentlyUsed.includes(name)) return

  recentlyUsed.unshift(name)
  if (recentlyUsed.length > 3) {
    recentlyUsed.pop()
  }
}