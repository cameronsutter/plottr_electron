import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as UIActions from 'actions/ui'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import SETTINGS from '../../../common/utils/settings'
import i18n from 'format-message'

class BookChooser extends Component {

  handleChange (id) {
    this.props.actions.changeCurrentTimeline(id)
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
    if (!SETTINGS.get('premiumFeatures')) return null

    const { ui, books } = this.props
    const seriesText = i18n('Series')
    let title = seriesText
    if (ui.currentTimeline != 'series') title = this.bookTitle(books[ui.currentTimeline])

    return <NavDropdown id='book_chooser' title={title}>
      <MenuItem onSelect={() => this.handleChange('series')}>{seriesText}</MenuItem>
      <MenuItem divider />
      { this.renderBookList() }
    </NavDropdown>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    books: state.books,
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