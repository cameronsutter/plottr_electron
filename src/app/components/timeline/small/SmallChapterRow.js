import React from 'react'
import { SmallLineTitle } from './SmallLineTitle'

export function SmallChapterRow ({ renderChapters, line, handleReorder, bookId }) {
  return <tr>
    <SmallLineTitle line={line} handleReorder={handleReorder} bookId={bookId}/>
    { renderChapters() }
  </tr>
}
