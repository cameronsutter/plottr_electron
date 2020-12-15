import path from 'path'
import React, { useState, useEffect } from 'react'
import t from 'format-message'
import cx from 'classnames'
import { FormControl } from 'react-bootstrap'
import { doesFileExist, useSortedKnownFiles } from '../../utils/files'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import { openKnownFile } from '../../utils/window_manager'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import MissingIndicator from './MissingIndicator'
import FileActions from './FileActions'

export default function RecentFiles (props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortedIds, filesById] = useSortedKnownFiles(searchTerm)
  const [missingFiles, setMissing] = useState([])
  const [selectedFile, selectFile] = useState(null)

  useEffect(() => {
    let newMissing = [...missingFiles]
    sortedIds.forEach((id) => {
      if (!doesFileExist(filesById[`${id}`].path)) {
        newMissing.push(id)
      }
    })
    setMissing(newMissing)
  }, [sortedIds, filesById])

  const openFile = (filePath, id) => {
    if (missingFiles.includes(id)) return
    openKnownFile(filePath, id)
  }

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
      let missing = null
      if (missingFiles.includes(id)) {
        missing = <MissingIndicator/>
      }
      const selected = selectedFile == id
      return <Row key={idx} onDoubleClick={() => openFile(f.path, id)} onClick={() => selectFile(selected ? null : id)} className={cx({'selected': selected})}>
        <Cell>
          <div className='dashboard__recent-files__file-cell'>
            <div>
              <div className='title'>{missing}{basename.replace('.pltr', '')}</div>
              <div className='secondary-text'>{formattedPath}</div>
            </div>
            <FileActions missing={!!missing} id={id} filePath={f.path} openFile={openFile}/>
          </div>
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
