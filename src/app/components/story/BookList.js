import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as BookActions from 'actions/books'
import i18n from 'format-message'
import Book from './Book'
import { Glyphicon } from 'react-bootstrap'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import cx from 'classnames'

class BookList extends Component {

  addBook = () => {
    this.props.actions.addBook()
  }

  reorder = (startIndex, endIndex) => {
    const list = this.props.books.allIds

    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);

    return list;
  }

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) return

    const ids = this.reorder(result.source.index, result.destination.index)
    this.props.actions.reorderBooks(ids)
  }

  renderBooks () {
    return this.props.books.allIds.map((id, idx) => {
      return <Draggable key={id} draggableId={id.toString()} index={idx}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
            className={cx('book-list__droppable', {dragging: snapshot.isDragging})}
          >
            <Book bookId={id} />
          </div>
        )}
      </Draggable>
    })
  }

  render () {
    return <div className='book-list__container'>
      <h2>{`${i18n('Books')} `}<span onClick={this.addBook}><Glyphicon glyph='plus'/></span></h2>
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId='droppable' direction='horizontal'>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              className={cx('book-list__list', {dragging: snapshot.isDraggingOver})}
              {...provided.droppableProps}
            >
              { this.renderBooks() }
              {provided.placeholder}
              <Book />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    actions: PropTypes.object,
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
    actions: bindActionCreators(BookActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BookList)