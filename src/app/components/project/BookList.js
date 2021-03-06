import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'
import Book from './Book'
import { Glyphicon } from 'react-bootstrap'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import cx from 'classnames'
import { chunk, flatten } from 'lodash'
import { newIds, actions } from 'pltr/v2'

const { objectId } = newIds

class BookList extends Component {
  dragDropAreaRef = React.createRef()
  bookRef = React.createRef()

  constructor(props) {
    super(props)
    // Defaults based on when this was written.
    // Updated when the component mounts.
    this.state = {
      bookWidth: 245,
      itemsPerRow: 5,
      rows: [props.books.allIds],
    }
  }

  componentDidMount() {
    this.updateLayout()
    window.addEventListener('resize', this.updateLayout)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateLayout)
  }

  componentDidUpdate(previousProps) {
    if (previousProps.books.allIds.length != this.props.books.allIds.length) {
      this.updateLayout()
    }
  }

  addBook = () => {
    const { actions, books, lineActions, beatActions } = this.props
    const newBookId = objectId(books.allIds)
    this.setState({
      rows: [
        ...this.state.rows.slice(0, this.state.rows.length - 1),
        [...this.state.rows[this.state.rows.length - 1], newBookId],
      ],
    })
    actions.addBook()
    // add a plotline
    lineActions.addLineWithTitle(i18n('Main Plot'), newBookId)
    // add a beat
    beatActions.addBeat(newBookId)
  }

  reorder = (bookIds, startIndex, endIndex) => {
    const [removed] = bookIds.splice(startIndex, 1)
    bookIds.splice(endIndex, 0, removed)

    return bookIds
  }

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) return

    const { source, destination } = result
    const sourceRow = +source.droppableId
    const destinationRow = +destination.droppableId
    const allIds = flatten(this.state.rows)
    // Maintains relative positioning at destination of drop
    const adjustForDownwardMovement = sourceRow < destinationRow ? -1 : 0
    const sourceRowOffset = sourceRow * this.state.itemsPerRow
    const destinationRowOffset = destinationRow * this.state.itemsPerRow
    const reOrderedIds = this.reorder(
      allIds,
      source.index + sourceRowOffset,
      destination.index + destinationRowOffset + adjustForDownwardMovement
    )
    this.setState({
      rows: chunk(reOrderedIds, this.state.itemsPerRow),
    })
    this.props.actions.reorderBooks(reOrderedIds)
  }

  updateLayout = () => {
    let newBookWidth
    if (this.bookRef.current) {
      const { width } = this.bookRef.current.getBoundingClientRect()
      newBookWidth = width
      this.setState({
        bookWidth: width,
      })
    }

    if (this.dragDropAreaRef.current) {
      const { width } = this.dragDropAreaRef.current
        .querySelector('#book-list')
        .getBoundingClientRect()
      const style = window.getComputedStyle(this.dragDropAreaRef.current)
      const leftPadding = parseInt(style.paddingLeft)
      const rightPadding = parseInt(style.paddingRight)
      const itemsPerRow = Math.floor(
        (width - (leftPadding + rightPadding)) / (newBookWidth || this.state.bookWidth)
      )
      this.setState({
        rows: chunk(this.props.books.allIds, itemsPerRow),
        itemsPerRow,
      })
    }
  }

  renderBooks(books) {
    return books.map((id, idx) => {
      return (
        <Draggable key={id} draggableId={id.toString()} index={idx}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={provided.draggableProps.style}
              className={cx('book-list__droppable', { dragging: snapshot.isDragging })}
            >
              {id === 0 ? (
                <Book bookId={id} bookNumber={idx + 1} ref={this.bookRef} />
              ) : (
                <Book bookId={id} bookNumber={idx + 1} />
              )}
            </div>
          )}
        </Draggable>
      )
    })
  }

  render() {
    return (
      <div className="book-list__container" ref={this.dragDropAreaRef}>
        <h2>
          {`${i18n('Books')} `}
          <span onClick={this.addBook}>
            <Glyphicon glyph="plus" />
          </span>
        </h2>
        <DragDropContext onDragEnd={this.onDragEnd}>
          {this.state.rows.map((row, index) => (
            <Droppable key={index} droppableId={`${index}`} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  id="book-list"
                  className={cx('book-list__list', { dragging: snapshot.isDraggingOver })}
                  {...provided.droppableProps}
                >
                  {this.renderBooks(row)}
                  {index === this.state.rows.length - 1 ? (
                    <>
                      {provided.placeholder}
                      <Book addBook={this.addBook} />
                    </>
                  ) : null}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    )
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    actions: PropTypes.object,
    lineActions: PropTypes.object,
    beatActions: PropTypes.object,
  }
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
    books: state.present.books,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.book, dispatch),
    lineActions: bindActionCreators(actions.line, dispatch),
    beatActions: bindActionCreators(actions.beat, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BookList)
