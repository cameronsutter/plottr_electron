import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { actions, helpers } from 'pltr/v2'

const {
  books: { isSeries },
} = helpers

const DISABLED_VIEWS = ['notes', 'characters', 'places', 'tags']

const BookChooserConnector = (connector) => {
  class BookChooser extends Component {
    handleChange(id) {
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
      const { ui, books, series } = this.props
      const seriesText =
        series.name == '' ? i18n('Series View') : `${series.name} (${i18n('Series View')})`
      let title = seriesText
      if (!isSeries(ui.currentTimeline)) title = this.bookTitle(books[ui.currentTimeline])

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
      ui: PropTypes.object.isRequired,
      books: PropTypes.object.isRequired,
      series: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
    }
  }

  const UIActions = actions.ui

  const { redux } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          ui: state.present.ui,
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
