import { is } from 'electron-util'

let darwinFonts = [
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier New',
  'Forum',
  'Georgia',
  'Impact',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
]
let windowsFonts = [
  'Arial',
  'Arial Black',
  'Calibri',
  'Cambria',
  'Comic Sans MS',
  'Courier New',
  'Forum',
  'Impact',
  'Segoe Script',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
]
let plottrFonts = ['Forum', 'IBM Plex Serif', 'Lato', 'Yellowtail']
let recentlyUsed = ['Forum']

export function getFonts() {
  if (is.macos) return darwinFonts
  if (is.windows) return windowsFonts

  return plottrFonts
}

export function getRecent() {
  return recentlyUsed
}

export function addRecent(name) {
  if (recentlyUsed.includes(name)) return

  recentlyUsed.unshift(name)
  if (recentlyUsed.length > 3) {
    recentlyUsed.pop()
  }
}
