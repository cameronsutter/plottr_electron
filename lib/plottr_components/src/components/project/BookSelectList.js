import React, { Component } from 'react'
import { difference } from 'lodash'
import PropTypes from 'react-proptypes'
import { Button, Glyphicon, Popover } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import OverlayTrigger from '../OverlayTrigger'
import UnconnectedImage from '../images/Image'
import cx from 'classnames'
import { helpers } from 'pltr/v2'

const {
  books: { isSeries },
} = helpers

const BookSelectListConnector = (connector) => {
  const Image = UnconnectedImage(connector)

  class BookSelectList extends Component {
    constructor(props) {
      super(props)

      this.renderUnSelected = this.renderUnSelected.bind(this)
    }

    renderUnSelected() {
      const { selectedBooks, books, parentId, add } = this.props
      const idsToList = difference(books.allIds, selectedBooks)
      let listItems = (
        <small>
          <i>{i18n('no more to add')}</i>
        </small>
      )
      if (idsToList.length) {
        listItems = idsToList.map((id) => {
          return (
            <li key={`book-${id}`} onClick={() => add(parentId, id)}>
              {books[id].title || i18n('Untitled')}
            </li>
          )
        })
      }
      const showSeries = !selectedBooks.some(isSeries)
      return (
        <Popover id="list-popover" title="">
          <ul className={cx('select-list__item-select-list', { 'series-select': showSeries })}>
            {showSeries ? (
              <li key="book-series" className="series" onClick={() => add(parentId, 'series')}>
                {i18n('Series')}
              </li>
            ) : null}
            {listItems}
          </ul>
        </Popover>
      )
    }

    renderSelected() {
      return this.props.selectedBooks.map((id) => {
        if (isSeries(id)) {
          return (
            <div key={id} className="chip">
              <span>{i18n('Series')}</span>
              <Glyphicon
                glyph="remove"
                onClick={() => this.props.remove(this.props.parentId, id)}
              />
            </div>
          )
        } else {
          let book = this.props.books[id]
          if (!book) return null
          return (
            <div key={id} className="chip">
              <Image size="xs" shape="circle" imageId={book.imageId} />
              <span>{book.title || i18n('Untitled')}</span>
              <Glyphicon
                glyph="remove"
                onClick={() => this.props.remove(this.props.parentId, id)}
              />
            </div>
          )
        }
      })
    }

    render() {
      return (
        <div className="select-list__wrapper">
          <label className="select-list__details-label">
            {i18n('Books')}:
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="right"
              overlay={this.renderUnSelected}
            >
              <Button bsSize="xsmall">
                <Glyphicon glyph="plus" />
              </Button>
            </OverlayTrigger>
          </label>
          {this.renderSelected()}
        </div>
      )
    }

    static propTypes = {
      parentId: PropTypes.number.isRequired,
      add: PropTypes.func.isRequired,
      remove: PropTypes.func.isRequired,
      selectedBooks: PropTypes.array.isRequired,
      books: PropTypes.object.isRequired,
      ui: PropTypes.object.isRequired,
    }
  }

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        ui: state.present.ui,
        books: state.present.books,
        series: state.present.series,
      }
    })(BookSelectList)
  }

  throw new Error('Could not connect BookSelectList.js')
}

export default BookSelectListConnector
