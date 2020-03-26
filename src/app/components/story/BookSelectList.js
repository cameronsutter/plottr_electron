import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as UIActions from 'actions/ui'
import { Button, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap'
import i18n from 'format-message'
import Image from '../images/Image'

class BookSelectList extends Component {
  renderUnSelected () {
    const { selectedBooks, books, parentId, add } = this.props
    const idsToList = _.difference(books.allIds, selectedBooks)
    let listItems = <small><i>{i18n('no more to add')}</i></small>
    if (idsToList.length) {
      listItems = idsToList.map(id => {
        return <li key={`book-${id}`} onClick={() => add(parentId, id)}>{books[id].title || i18n('Untitled')}</li>
      })
    }
    return <Popover id='list-popover' title={i18n('Books')}>
      <ul className='select-list__item-select-list'>
        <li key='book-series' onClick={() => add(parentId, 'series')}>{i18n('Series')}</li>
        {listItems}
      </ul>
    </Popover>
  }

  renderSelected () {
    return this.props.selectedBooks.map(id => {
      let book = this.props.books[id]
      if (!book) return null
      return <div key={id} className='chip'>
        <Image size='xs' shape='circle' imageId={book.imageId}/>
        <span>{ book.title || i18n('Untitled') }</span>
        <Glyphicon glyph='remove' onClick={() => this.props.remove(this.props.parentId, id)}/>
      </div>
    })
  }

  render () {
    return <div className='select-list__wrapper'>
      <label className='select-list__details-label'>{i18n('Books')}:
        <OverlayTrigger trigger="click" rootClose placement="right" overlay={this.renderUnSelected()}>
          <Button ref='characterList' bsSize='xsmall'>
            <Glyphicon glyph='plus'/>
          </Button>
        </OverlayTrigger>
      </label>
      {this.renderSelected()}
    </div>
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

function mapStateToProps (state) {
  return {
    ui: state.ui,
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
)(BookSelectList)
