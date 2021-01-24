import {
  INITIAL_ZOOM_INDEX,
  INITIAL_ZOOM_STATE,
  ZOOM_STATES,
  FIT_ZOOM_STATE,
} from 'constants/zoom_states'

export function isZoomed({ zoomState, zoomIndex }) {
  if (zoomIndex == null || zoomIndex == undefined) return false // neither value is set yet
  return zoomState !== INITIAL_ZOOM_STATE || zoomIndex < INITIAL_ZOOM_INDEX
}

export function isZoomedOut({ zoomState, zoomIndex }) {
  if (zoomIndex == null || zoomIndex == undefined) return false // neither value is set yet
  return zoomState !== INITIAL_ZOOM_STATE || zoomIndex > INITIAL_ZOOM_INDEX
}

export function computeZoom(elem, { zoomIndex, zoomState, orientation }) {
  let scale = ZOOM_STATES[zoomIndex]
  if (elem && zoomState === FIT_ZOOM_STATE) {
    if (orientation === 'horizontal') {
      scale = (window.outerWidth - 10) / elem.scrollWidth
    } else {
      // take into account navigation height
      scale = (window.outerHeight - 150) / elem.scrollHeight
    }
  }
  return `scale(${scale}, ${scale})`
}

export function computeZoomMultiplier(orientation, { zoomIndex, zoomState }) {
  let scale = ZOOM_STATES[zoomIndex]
  if (orientation == 'horizontal') return 1 / scale
  if (orientation == 'vertical') return 0.99
}

// TODO: figure out the right values here
export function computeZoomOutMultiplier(orientation, { zoomIndex, zoomState }) {
  return 1
}
