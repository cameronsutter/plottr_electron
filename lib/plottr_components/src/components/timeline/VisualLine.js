import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { helpers } from 'pltr/v2'
import cx from 'classnames'

const {
  orientedClassName: { orientedClassName },
} = helpers

const measurements = {
  horizontal: {
    medium: {
      first: 85,
      last: 161 + 50,
    },
    large: {
      first: 155,
      last: 161 + 50,
    },
  },
  vertical: {
    medium: {
      first: 120,
      last: 70 + 40,
    },
    large: {
      first: 100,
      last: 70 + 40,
    },
  },
}

const getMargins = (orientation, isMedium) => {
  const sizeKey = isMedium ? 'medium' : 'large'
  const entry = measurements[orientation][sizeKey]
  return entry.first + entry.last
}

export default function VisualLine({
  color,
  orientation,
  isMedium,
  tableLength,
  offset,
  disableAnimation,
}) {
  const [margins, setMargins] = useState(getMargins(orientation, isMedium))
  const [currentLength, setCurrentLength] = useState(disableAnimation ? tableLength : 0)
  const [maxLength, setMaxLength] = useState(0)
  const [intervalId, setId] = useState(null)
  const [animationStarted, setAnimationStarted] = useState(false)

  useEffect(() => {
    setMargins(getMargins(orientation, isMedium))
  }, [orientation, isMedium])

  useEffect(() => {
    if (!disableAnimation && tableLength && tableLength > 0) {
      if (!animationStarted) {
        setMaxLength(tableLength - margins)
        setAnimationStarted(true)
      }
    }
  }, [tableLength, margins, maxLength])

  useEffect(() => {
    if (disableAnimation) return
    if (!animationStarted) return
    if (!maxLength) return

    const id = setInterval(() => {
      setCurrentLength((currentLength) => {
        let nextLength = currentLength + 100
        if (nextLength > maxLength) nextLength = maxLength
        return nextLength
      })
    }, 10)
    setId(id)

    return () => clearInterval(id)
  }, [animationStarted])

  useEffect(() => {
    if (currentLength == maxLength) {
      clearInterval(intervalId)
      setAnimationStarted(false)
    }
  }, [currentLength])

  if (!currentLength) return null

  // for preview lines, the orientation is flipped in props passed in from BeatTitleCell
  let translation =
    orientation == 'vertical' ? `translate(${offset || 0}px, 0)` : `translate(0, ${offset || 0}px)`

  const lineStyle = {
    borderColor: color,
    transform: translation,
  }

  if (orientation == 'horizontal') {
    lineStyle.width = `${currentLength}px`
  } else {
    lineStyle.height = `${currentLength}px`
  }
  const lineKlass = cx(orientedClassName('line-title__line-line', orientation), {
    'medium-timeline': isMedium,
  })
  return <div className={lineKlass} style={lineStyle}></div>
}

VisualLine.propTypes = {
  offset: PropTypes.number,
  color: PropTypes.string,
  orientation: PropTypes.string,
  tableLength: PropTypes.number,
  isMedium: PropTypes.bool,
  disableAnimation: PropTypes.bool,
}
