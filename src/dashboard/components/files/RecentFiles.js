import React from 'react'
import t from 'format-message'
import { useSortedKnownFiles } from '../../utils/files'
import prettydate from 'pretty-date'
import path from 'path'
import { StickyTable, Row, Cell } from 'react-sticky-table'

export default function RecentFiles (props) {
  const [sortedIds, filesById] = useSortedKnownFiles()

  const renderRecents = () => {
    // if no files, show something different
    if (!sortedIds.length) return null

    const renderedFiles = sortedIds.map((id, idx) => {
      const f = filesById[`${id}`]
      const lastOpen = new Date(f.lastOpened)
      const basename = path.basename(f.path)
      const formattedPath = f.path.replace(basename, '').split(path.sep).filter(Boolean).join(' » ')
      return <Row key={idx}>
        <Cell>
          <div>{basename}</div>
          <div className='secondary-text'>{formattedPath}</div>
        </Cell>
        <Cell>
          <div>{t('{date, date, monthDay}', {date: lastOpen})}</div>
          <div className='secondary-text'>{prettydate.format(lastOpen)}</div>
        </Cell>
      </Row>
    })

    return <div className='dashboard__recent-files__table'>
      <StickyTable leftStickyColumnCount={0}>
        <Row>
          <Cell>{t('Name')}</Cell>
          <Cell>{t('Last opened by you')}</Cell>
        </Row>
        { renderedFiles }
      </StickyTable>
    </div>
  }

  return <div className='dashboard__recent-files'>
    <h1>{t('Your Files')}</h1>
    { renderRecents() }
  </div>
}