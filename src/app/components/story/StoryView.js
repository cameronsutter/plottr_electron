import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SETTINGS from '../../../common/utils/settings'
import BookDialog from './BookDialog'
import EditSeries from './EditSeries'
import BookList from './BookList'

class StoryView extends Component {
  renderSeries () {
    return <div>
      <EditSeries />
      <BookList />
    </div>
  }

  renderBook1 () {
    return <BookDialog modal={false} bookId={1} />
  }

  render () {
    if (SETTINGS.get('premiumFeatures')) {
      return this.renderSeries()
    } else {
      return this.renderBook1()
    }
  }

  static propTypes = {

  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    series: state.series,
    books: state.books,
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StoryView)