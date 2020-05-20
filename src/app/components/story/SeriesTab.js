import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import EditSeries from './EditSeries'
import BookList from './BookList'
import i18n from 'format-message'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default class SeriesTab extends Component {
  render () {
    return <ErrorBoundary>
      <div>
        <h2 style={{paddingLeft: '40px'}}>{i18n('Series')}</h2>
        <EditSeries />
        <BookList />
      </div>
    </ErrorBoundary>
  }

  static propTypes = {}
}
