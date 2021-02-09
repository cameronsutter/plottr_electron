import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import {
  Glyphicon,
  Button,
  ButtonGroup,
  FormControl,
  FormGroup,
  ControlLabel,
} from 'react-bootstrap'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { actions, helpers, selectors } from 'pltr/v2'
import InputModal from '../dialogs/InputModal'

const {
  card: { truncateTitle },
  chapters: { editingChapterLabel, chapterPositionTitle },
  orientedClassName: { orientedClassName },
} = helpers

class ChapterTitleCell extends PureComponent {
  constructor(props) {
    super(props)
    let editing = props.chapter.title == ''
    this.state = {
      hovering: false,
      editing: editing,
      dragging: false,
      inDropZone: false,
      dropDepth: 0,
      deleting: false,
    }
    this.titleInputRef = React.createRef()
  }

  deleteChapter = (e) => {
    e.stopPropagation()
    if (this.props.isSeries) {
      this.props.beatActions.deleteBeat(this.props.chapter.id)
    } else {
      this.props.actions.deleteScene(this.props.chapter.id, this.props.ui.currentTimeline)
    }
  }

  cancelDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false })
  }

  handleDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: true, hovering: false })
  }

  editTitle = () => {
    const id = this.props.chapter.id
    const ref = this.titleInputRef.current
    if (!ref) return null

    if (this.props.isSeries) {
      if (ref.value == '') return null // don't allow nothing
      this.props.beatActions.editBeatTitle(id, ref.value)
      this.setState({ editing: false, hovering: false })
    } else {
      // if nothing, set to auto
      this.props.actions.editSceneTitle(id, ref.value || 'auto')
      this.setState({ editing: false, hovering: false })
    }
  }

  // AFTER MERGE-CONFLICTs
  // editTitle can call this function
  finalizeEdit = (newVal) => {
    const { chapter, beatActions } = this.props
    // if nothing, set to auto
    beatActions.editBeatTitle(chapter.id, newVal || 'auto')
    this.setState({ editing: false, hovering: false })
  }

  handleFinishEditing = (event) => {
    if (event.which === 13) {
      this.editTitle()
    }
  }

  handleBlur = () => {
    this.editTitle()
  }

  handleEsc = (event) => {
    if (event.which === 27) this.setState({ editing: false })
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.chapter))
    this.setState({ dragging: true })
  }

  handleDragEnd = () => {
    this.setState({ dragging: false })
  }

  handleDragEnter = (e) => {
    if (!this.state.dragging) this.setState({ dropDepth: this.state.dropDepth + 1 })
  }

  handleDragOver = (e) => {
    e.preventDefault()
    if (!this.state.dragging) this.setState({ inDropZone: true })
  }

  handleDragLeave = (e) => {
    if (!this.state.dragging) {
      let dropDepth = this.state.dropDepth
      --dropDepth
      this.setState({ dropDepth: dropDepth })
      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }
  }

  handleDrop = (e) => {
    e.stopPropagation()
    if (this.state.dragging) return
    this.setState({ inDropZone: false, dropDepth: 0 })

    var json = e.dataTransfer.getData('text/json')
    var droppedChapter = JSON.parse(json)
    if (droppedChapter.id == null) return
    if (droppedChapter.id == this.props.chapter.id) return

    this.props.handleReorder(this.props.chapter.position, droppedChapter.position)
  }

  startEditing = () => {
    this.setState({ editing: true, hovering: false })
  }

  startHovering = () => {
    this.setState({ hovering: true })
  }

  stopHovering = () => {
    this.setState({ hovering: false })
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.chapterTitle}
        onDelete={this.deleteChapter}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderEditInput() {
    if (!this.state.editing) return null

    return (
      <InputModal
        isOpen={true}
        type="text"
        getValue={this.finalizeEdit}
        defaultValue={this.props.chapter.title}
        title={i18n('Edit {chapterName}', { chapterName: this.props.chapterTitle })}
        cancel={() => this.setState({ editing: false, hovering: false })}
      />
    )
  }

  renderHorizontalHoverOptions(style) {
    const { ui, isSmall } = this.props
    const klasses = orientedClassName('chapter-list__item__hover-options', ui.orientation)
    return (
      <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
        <ButtonGroup>
          <Button bsSize={isSmall ? 'small' : 'medium'} onClick={this.startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button bsSize={isSmall ? 'small' : 'medium'} onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  renderVerticalHoverOptions(style) {
    const { ui, isSmall } = this.props
    const klasses = orientedClassName('chapter-list__item__hover-options', ui.orientation)
    return (
      <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
        <Button bsSize={isSmall ? 'small' : 'medium'} block onClick={this.startEditing}>
          <Glyphicon glyph="edit" />
        </Button>
        <Button bsSize={isSmall ? 'small' : 'medium'} block onClick={this.handleDelete}>
          <Glyphicon glyph="trash" />
        </Button>
      </div>
    )
  }

  renderHoverOptions() {
    let style = {}
    if (this.props.isSmall) {
      style = { display: 'none' }
      if (this.state.hovering) style.display = 'block'
    } else {
      style = { visibility: 'hidden' }
      if (this.state.hovering) style.visibility = 'visible'
    }

    if (this.props.ui.orientation === 'vertical') {
      return this.renderVerticalHoverOptions(style)
    } else {
      return this.renderHorizontalHoverOptions(style)
    }
  }

  renderTitle() {
    const { chapter, chapterTitle, positionOffset, isSeries } = this.props
    if (!this.state.editing) return <span>{truncateTitle(chapterTitle, 50)}</span>

    return (
      <FormGroup>
        <ControlLabel>{editingChapterLabel(chapter, positionOffset, isSeries)}</ControlLabel>
        <FormControl
          type="text"
          defaultValue={chapter.title}
          inputRef={this.titleInputRef}
          autoFocus
          onKeyDown={this.handleEsc}
          onBlur={this.handleBlur}
          onKeyPress={this.handleFinishEditing}
        />
      </FormGroup>
    )
  }

  render() {
    window.SCROLLWITHKEYS = !this.state.editing
    const { chapter, ui, positionOffset, chapterTitle, isSeries, isSmall } = this.props
    const { hovering, inDropZone } = this.state
    let innerKlass = cx(orientedClassName('chapter__body', ui.orientation), {
      hover: hovering,
      dropping: inDropZone,
    })

    if (isSmall) {
      const isHorizontal = ui.orientation == 'horizontal'
      const klasses = {
        'rotate-45': isHorizontal,
        'row-header': !isHorizontal,
        dropping: inDropZone,
      }
      return (
        <th
          className={cx(klasses)}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
        >
          {this.renderHoverOptions()}
          {this.renderDelete()}
          {this.renderEditInput()}
          <div
            title={chapterPositionTitle(chapter, positionOffset, isSeries)}
            onClick={hovering ? this.stopHovering : this.startHovering}
            draggable
            onDragStart={this.handleDragStart}
            onDragEnd={this.handleDragEnd}
          >
            <span>{truncateTitle(chapterTitle, 50)}</span>
          </div>
        </th>
      )
    } else {
      return (
        <Cell className="chapter-table-cell">
          <div
            className={orientedClassName('chapter__cell', ui.orientation)}
            title={chapterPositionTitle(chapter, positionOffset, isSeries)}
            onMouseEnter={this.startHovering}
            onMouseLeave={this.stopHovering}
            onDrop={this.handleDrop}
          >
            {this.renderHoverOptions()}
            {this.renderDelete()}
            <div
              className={innerKlass}
              onClick={this.startEditing}
              draggable
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
              onDragEnter={this.handleDragEnter}
              onDragOver={this.handleDragOver}
              onDragLeave={this.handleDragLeave}
            >
              {this.renderTitle()}
            </div>
          </div>
        </Cell>
      )
    }
  }
}

ChapterTitleCell.propTypes = {
  chapterId: PropTypes.number.isRequired,
  handleReorder: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  beatActions: PropTypes.object.isRequired,
  chapters: PropTypes.array.isRequired,
  chapter: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
  chapterTitle: PropTypes.string.isRequired,
  positionOffset: PropTypes.number.isRequired,
  isSmall: PropTypes.bool.isRequired,
  isMedium: PropTypes.bool.isRequired,
}

const makeMapState = (state) => {
  const uniqueChapterSelector = selectors.makeChapterSelector()
  const uniqueChapterTitleSelector = selectors.makeChapterTitleSelector()

  return function mapStateToProps(state, ownProps) {
    return {
      chapters: state.present.chapters,
      chapter: uniqueChapterSelector(state.present, ownProps.chapterId),
      ui: state.present.ui,
      isSeries: selectors.isSeriesSelector(state.present),
      chapterTitle: uniqueChapterTitleSelector(state.present, ownProps.chapterId),
      positionOffset: selectors.positionOffsetSelector(state.present),
      isSmall: selectors.isSmallSelector(state.present),
      isMedium: selectors.isMediumSelector(state.present),
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.scene, dispatch),
    beatActions: bindActionCreators(actions.beat, dispatch),
  }
}

export default connect(makeMapState, mapDispatchToProps)(ChapterTitleCell)
