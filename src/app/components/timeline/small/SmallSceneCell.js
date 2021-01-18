import React from 'react'

export function SmallSceneCell (props) {
  const {
    cards,
    chapterId,
    lineId,
    chapterPosition,
    linePosition,
    color,
  } = props

  return <td>
    <div className='card-circle' style={{backgroundColor: color}}/>
  </td>
}