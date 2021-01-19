import React, { useEffect, useState } from 'react'
import orientedClassName from '../../helpers/orientedClassName'

const Horizontal = {
  first: 155,
  last: 161 + 50,
}

const Vertical = {
  first: 100,
  last: 70 + 40,
}

const getMargins = (orientation) => {
  return orientation == 'horizontal' ? Horizontal.first + Horizontal.last : Vertical.first + Vertical.last
}

export default function VisualLine ({ color, orientation, tableLength }) {
  const [margins, setMargins] = useState(getMargins(orientation))
  const [currentLength, setCurrentLength] = useState(0)
  const [maxLength, setMaxLength] = useState(0)
  const [intervalId, setId] = useState(null)

  useEffect(() => {
    setMargins(getMargins(orientation))
  }, [orientation])

  useEffect(() => {
    if (tableLength && tableLength > 0) {
      if (!maxLength) setMaxLength(tableLength - margins)
    }
  }, [tableLength, margins, maxLength])

  useEffect(() => {
    if (!maxLength) return
    if (intervalId) return

    const id = setInterval(() => {
      setCurrentLength(currentLength => {
        let nextLength = currentLength + 100
        if (nextLength > maxLength) nextLength = maxLength
        return maxLength
      })
    }, 10)
    setId(id)

    return () => clearInterval(id)
  }, [maxLength])

  useEffect(() => {
    if (currentLength == maxLength) clearInterval(intervalId)
  }, [currentLength])

  if (!currentLength) return null

  const lineStyle = {
    borderColor: color,
  }

  if (orientation == 'horizontal') {
    lineStyle.width = `${currentLength}px`
  } else {
    lineStyle.height = `${currentLength}px`
  }
  return <div className={orientedClassName('line-title__line-line', orientation)} style={lineStyle}></div>
}