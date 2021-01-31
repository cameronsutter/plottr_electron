import React, { Component } from 'react'
import { difference } from 'lodash'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as UIActions from 'actions/ui'
import { Button, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap'
import i18n from 'format-message'
import Image from '../images/Image'
import cx from 'classnames'

class BookSelectList extends Component {
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
    const showSeries = !selectedBooks.includes('series')
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
      if (id == 'series') {
        return (
          <div key={id} className="chip">
            <span>{i18n('Series')}</span>
            <Glyphicon glyph="remove" onClick={() => this.props.remove(this.props.parentId, id)} />
          </div>
        )
      } else {
        let book = this.props.books[id]
        if (!book) return null
        return (
          <div key={id} className="chip">
            <Image size="xs" shape="circle" imageId={book.imageId} />
            <span>{book.title || i18n('Untitled')}</span>
            <Glyphicon glyph="remove" onClick={() => this.props.remove(this.props.parentId, id)} />
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
            overlay={this.renderUnSelected()}
          >
            <Button ref="characterList" bsSize="xsmall">
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

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
    books: state.present.books,
    series: state.present.series,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(BookSelectList)
