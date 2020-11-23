import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import EditSeries from './EditSeries'
import BookList from './BookList'
import i18n from 'format-message'
import ErrorBoundary from '../../containers/ErrorBoundary'
import FileLocation from './FileLocation'

export default class SeriesTab extends Component {
  render () {
    return <ErrorBoundary>
      <div className='series__container'>
        <FileLocation />
        <EditSeries />
        <BookList />
      </div>
    </ErrorBoundary>
  }

  static propTypes = {}
}
