import path from 'path'
import React, { useState } from 'react'
import t from 'format-message'
import { FormControl } from 'react-bootstrap'
import { useSortedKnownFiles } from '../../utils/files'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import { openKnownFile } from '../../utils/window_manager'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'

export default function RecentFiles (props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortedIds, filesById] = useSortedKnownFiles(searchTerm)

  const renderRecents = () => {
    // TODO: if no files, show something different
    if (!sortedIds.length) return null

    const renderedFiles = sortedIds.map((id, idx) => {
      const f = filesById[`${id}`]
      const lastOpen = new Date(f.lastOpened)
      const basename = path.basename(f.path)
      let formattedPath = ''
      if (!f.path.includes(TEMP_FILES_PATH)) {
        formattedPath = f.path.replace(basename, '').split(path.sep).filter(Boolean).join(' » ')
      }
      return <Row key={idx} onDoubleClick={() => openKnownFile(f.path, id)}>
        <Cell>
          <div className='title'>{basename.replace('.pltr', '')}</div>
          <div className='secondary-text'>{formattedPath}</div>
        </Cell>
        <Cell>
          <div className='lastOpen'>{t('{date, date, monthDay}', {date: lastOpen})}</div>
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
    <FormControl type='search' placeholder={t('Search')} className='dashboard__search' onChange={event => setSearchTerm(event.target.value)} />
    <h1>{t('Recent Projects')}</h1>
    { renderRecents() }
  </div>
}