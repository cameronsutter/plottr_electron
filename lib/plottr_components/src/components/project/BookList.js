import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import UnconnectedBook from './Book'
import UnconnectedBookDialog from './BookDialog'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import cx from 'classnames'
import { chunk, flatten } from 'lodash'
import { newIds } from 'pltr/v2'

import { checkDependencies } from '../checkDependencies'

const { objectId } = newIds

const BookListConnector = (connector) => {
  const Book = UnconnectedBook(connector)
  const BookDialog = UnconnectedBookDialog(connector)

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

    addBook = (template) => {
      const { actions, books } = this.props
      if (template) return actions.addBookFromTemplate(template.templateData)

      const newBookId = objectId(books.allIds)
      const rows = this.state.rows.filter((row) => row)
      this.setState({
        rows: [...rows.slice(0, rows.length - 1), [...rows[rows.length - 1], newBookId]],
      })
      actions.addBook()
    }

    reorder = (bookIds, startIndex, endIndex) => {
      const [removed] = bookIds.splice(startIndex, 1)
      bookIds.splice(endIndex, 0, removed)

      return bookIds
    }

    chunkAccountingForAdd = (ids, itemsPerRow) => {
      const chunks = chunk(ids, itemsPerRow)
      if (chunks[chunks.length - 1].length === itemsPerRow) {
        return [...chunks, null]
      }
      return chunks
    }

    onDragEnd = (result) => {
      // dropped outside the list
      if (!result.destination) return

      const { source, destination } = result
      const sourceRow = +source.droppableId
      const destinationRow = +destination.droppableId
      const allIds = flatten(this.state.rows).filter((x) => x)
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
        rows: this.chunkAccountingForAdd(reOrderedIds, this.state.itemsPerRow),
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
        const bookList = this.dragDropAreaRef.current.querySelector('#book-list')
        if (!bookList) return
        const { width } = bookList.getBoundingClientRect()
        const style = window.getComputedStyle(this.dragDropAreaRef.current)
        const leftPadding = parseInt(style.paddingLeft)
        const rightPadding = parseInt(style.paddingRight)
        const itemsPerRow = Math.floor(
          (width - (leftPadding + rightPadding)) / (newBookWidth || this.state.bookWidth)
        )
        this.setState({
          rows: this.chunkAccountingForAdd(this.props.books.allIds, itemsPerRow),
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

    renderBookDialog = () => {
      const { isBookDialogVisible } = this.props

      if (!isBookDialogVisible) return false

      return <BookDialog />
    }

    render() {
      return (
        <div className="book-list__container" ref={this.dragDropAreaRef}>
          <h2>{t('Books')}</h2>
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
                    {row && this.renderBooks(row)}
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
          {this.renderBookDialog()}
        </div>
      )
    }

    static propTypes = {
      books: PropTypes.object.isRequired,
      lines: PropTypes.array.isRequired,
      cards: PropTypes.array.isRequired,
      actions: PropTypes.object,
      lineActions: PropTypes.object,
      beatActions: PropTypes.object,
      uiActions: PropTypes.object,
      isBookDialogVisible: PropTypes.bool,
    }
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          books: state.present.books,
          lines: state.present.lines,
          cards: state.present.cards,
          isBookDialogVisible: selectors.isBookDialogVisibleSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.book, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
          lineActions: bindActionCreators(actions.line, dispatch),
          beatActions: bindActionCreators(actions.beat, dispatch),
        }
      }
    )(BookList)
  }

  throw new Error('Could not connect BookList')
}

export default BookListConnector
