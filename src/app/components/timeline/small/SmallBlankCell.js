import React from 'react'

export function SmallBlankCell (props) {
  const {
    chapterId,
    lineId,
    color,
  } = props

  return <td>
    <div className='blank-circle' style={{borderColor: color}}/>
  </td>
}