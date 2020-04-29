import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as UIActions from 'actions/ui'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import i18n from 'format-message'

const DISABLED_VIEWS = ['notes', 'characters', 'places', 'tags']

class BookChooser extends Component {

  handleChange (id) {
    this.props.actions.changeCurrentTimeline(id)
    if (this.props.ui.currentView == 'story') {
      this.props.actions.changeCurrentView('timeline')
    }
  }

  isDisabled = () => {
    return DISABLED_VIEWS.includes(this.props.ui.currentView)
  }

  bookTitle = (book) => {
    return book.title || i18n('Untitled')
  }

  renderBookList () {
    const { books } = this.props
    return books.allIds.map(id => {
      return <MenuItem key={id} onSelect={() => this.handleChange(id)}>{this.bookTitle(books[id])}</MenuItem>
    })
  }

  render () {
    const { ui, books, series } = this.props
    const seriesText = series.name == '' ? i18n('Series View') : `${series.name} (${i18n('Series View')})`
    let title = seriesText
    if (ui.currentTimeline != 'series') title = this.bookTitle(books[ui.currentTimeline])

    return <NavDropdown id='book_chooser' title={title} disabled={this.isDisabled()}>
      <MenuItem onSelect={() => this.handleChange('series')}>{seriesText}</MenuItem>
      <MenuItem divider />
      { this.renderBookList() }
    </NavDropdown>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    books: state.books,
    series: state.series,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BookChooser)