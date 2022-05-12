import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import { actions, helpers } from 'pltr/v2'

import NavDropdown from '../NavDropdown'
import MenuItem from '../MenuItem'
import { checkDependencies } from '../checkDependencies'

const {
  books: { isSeries },
} = helpers

const DISABLED_VIEWS = ['notes', 'characters', 'places', 'tags']

const BookChooserConnector = (connector) => {
  class BookChooser extends Component {
    handleChange(id) {
      this.props.actions.changeCurrentTimeline(id)
      if (this.props.currentView == 'story') {
        this.props.actions.changeCurrentView('timeline')
      }
    }

    isDisabled = () => {
      return DISABLED_VIEWS.includes(this.props.currentView)
    }

    bookTitle = (book) => {
      return book.title || i18n('Untitled')
    }

    renderBookList() {
      const { books } = this.props
      return books.allIds.map((id) => {
        const book = books[id] || books[`${id}`]
        return (
          <MenuItem key={id} onSelect={() => this.handleChange(id)}>
            {this.bookTitle(book)}
          </MenuItem>
        )
      })
    }

    render() {
      const { currentTimeline, books, series } = this.props
      const seriesText =
        series.name == '' ? i18n('Series View') : `${series.name} (${i18n('Series View')})`
      let title = seriesText
      const currentBook = books[currentTimeline] || books[books.allIds[0]]
      if (!isSeries(currentTimeline)) title = this.bookTitle(currentBook)

      return (
        <NavDropdown
          id="book_chooser"
          title={title}
          disabled={this.isDisabled()}
          style={{ margin: '0 16px 0 8px' }}
          onClick={(e) => e.stopPropagation(e)}
        >
          <MenuItem onSelect={() => this.handleChange('series')}>{seriesText}</MenuItem>
          <MenuItem divider />
          {this.renderBookList()}
        </NavDropdown>
      )
    }

    static propTypes = {
      currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      currentView: PropTypes.string.isRequired,
      books: PropTypes.object.isRequired,
      series: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
    }
  }

  const UIActions = actions.ui

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          currentTimeline: selectors.currentTimelineSelector(state.present),
          currentView: selectors.currentViewSelector(state.present),
          books: state.present.books,
          series: state.present.series,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(UIActions, dispatch),
        }
      }
    )(BookChooser)
  }

  throw new Error('Could not connect BookChooser')
}

export default BookChooserConnector
