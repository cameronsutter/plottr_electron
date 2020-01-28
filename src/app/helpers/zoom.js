import { INITIAL_ZOOM_INDEX, INITIAL_ZOOM_STATE, ZOOM_STATES, FIT_ZOOM_STATE } from 'constants/zoom_states'

export function isZoomed ({ zoomState, zoomIndex }) {
  if (!zoomIndex) return false // neither value is set yet
  return (zoomState !== INITIAL_ZOOM_STATE) && (zoomIndex <= INITIAL_ZOOM_INDEX)
}

// zoomFactor allows us to scale cards and scenes in a ratio that fits the scale determined by zoomState
export function zoomFactor ({ zoomState, zoomIndex }) {
  return zoomState === FIT_ZOOM_STATE ? FIT_ZOOM_STATE : ZOOM_STATES[zoomIndex]
}

export function computeZoomKlass ({zoomIndex, zoomState}) {
  if (zoomState === INITIAL_ZOOM_STATE) return `zoomed-${INITIAL_ZOOM_INDEX}`
  return `zoomed-${zoomIndex}`
}

// might be able to use this for zoom fit
export function computeZoom (elem, {zoomIndex, zoomState, orientation}) {
  if (zoomState === INITIAL_ZOOM_STATE) return {transform: INITIAL_ZOOM_STATE}
  const scale = computeScale(elem, {zoomIndex, zoomState, orientation})
  return {transform: `scale(${scale}, ${scale})`, transformOrigin: 'left top'}
}

function computeScale (elem, {zoomIndex, zoomState, orientation}) {
  let value = ZOOM_STATES[zoomIndex]
  if (elem && zoomState === FIT_ZOOM_STATE) {
    if (orientation === 'horizontal') {
      value = (window.outerWidth - 10) / elem.scrollWidth
    } else {
      // take into account navigation height
      value = (window.outerHeight - 150) / elem.scrollHeight
    }
  }
  return value
}