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
      last: 161,
    },
    large: {
      first: 155,
      last: 10,
    },
  },
  vertical: {
    medium: {
      first: 35,
      last: 35,
    },
    large: {
      first: 200,
      last: 10,
    },
  },
}

const getMargins = (orientation, isMedium) => {
  const sizeKey = isMedium ? 'medium' : 'large'
  const entry = measurements[orientation][sizeKey]
  return entry.first + entry.last
}

const nop = () => {}

export default function VisualLine({ color, orientation, isMedium, tableLength }) {
  const [margins, setMargins] = useState(getMargins(orientation, isMedium))
  const [currentLength, setCurrentLength] = useState(0)
  const [maxLength, setMaxLength] = useState(0)
  const [intervalId, setId] = useState(null)
  const [animationStarted, setAnimationStarted] = useState(false)

  useEffect(() => {
    setMargins(getMargins(orientation, isMedium))
  }, [orientation, isMedium])

  useEffect(() => {
    if (tableLength && tableLength > 0) {
      if (!animationStarted) {
        setMaxLength(tableLength - margins)
        setAnimationStarted(true)
      }
    }
  }, [tableLength, margins, maxLength, setAnimationStarted, animationStarted])

  useEffect(() => {
    if (!animationStarted) return nop
    if (!maxLength) return nop

    let nextLength = currentLength + 100
    if (nextLength > maxLength) nextLength = maxLength

    const id = setInterval(() => {
      setCurrentLength(nextLength)
    }, 10)
    setId(id)

    return () => clearInterval(id)
  }, [animationStarted, currentLength, maxLength, setId, setCurrentLength])

  useEffect(() => {
    if (currentLength == maxLength) {
      clearInterval(intervalId)
      setAnimationStarted(false)
    }
  }, [currentLength, maxLength, intervalId, setAnimationStarted])

  if (!currentLength) return null

  const lineStyle = {
    borderColor: color,
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
  color: PropTypes.string,
  orientation: PropTypes.string,
  tableLength: PropTypes.number,
  isMedium: PropTypes.bool,
}
