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

let webFonts = [
  'American Typewriter',
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Bradley Hand',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier New',
  'Didot',
  'Garamond',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Luminari',
  'Monaco',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
]

let plottrFonts = ['Forum', 'IBM Plex Serif', 'Lato', 'Yellowtail']
let recentlyUsed = ['Forum']

export function getFonts(os) {
  if (os === 'macos') return darwinFonts
  if (os === 'windows') return windowsFonts
  if (os === 'linux' || !os) return plottrFonts
  return [...plottrFonts, ...webFonts]
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
