import React from 'react'
import t from 'format-message'
import { useSortedKnownFiles } from '../../utils/files'

export default function RecentFiles (props) {
  const [sortedIds, filesById] = useSortedKnownFiles()

  const renderRecents = () => {
    if (!sortedIds.length) return null

    const renderedFiles = sortedIds.map((id, idx) => {
      const f = filesById[`${id}`]
      return <tr key={idx}>
        <td></td>
        <td>{f.path}</td>
        <td>{f.lastOpened}</td>
      </tr>
    })

    // if no recents, do something different
    return <table className='dashboard__recent-files__table'>
      <thead>
        <tr>
          <th></th>
          <th>{t('Name')}</th>
          <th>{t('Last opened by you')}</th>
        </tr>
      </thead>
      <tbody>
        { renderedFiles }
      </tbody>
    </table>
  }

  return <div className='dashboard__recent-files'>
    <h1>{t('Recent Files')}</h1>
    { renderRecents() }
  </div>
}