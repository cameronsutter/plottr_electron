import React, { PureComponent } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { Cell } from 'react-sticky-table'
import * as SceneActions from 'actions/scenes'
import * as BeatActions from 'actions/beats'
import orientedClassName from 'helpers/orientedClassName'
import { editingChapterLabel, chapterPositionTitle } from '../../helpers/chapters'
import { isSeriesSelector } from '../../selectors/ui'
import { makeChapterTitleSelector, makeChapterSelector, positionOffsetSelector } from '../../selectors/chapters'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'

class ChapterTitleCell extends PureComponent {
  constructor (props) {
    super(props)
    let editing = props.chapter.title == ''
    this.state = {hovering: false, editing: editing, dragging: false, dropping: false, deleting: false}
  }

  deleteChapter = e => {
    e.stopPropagation()
    if (this.props.isSeries) {
      this.props.beatActions.deleteBeat(this.props.chapter.id)
    } else {
      this.props.actions.deleteScene(this.props.chapter.id, this.props.ui.currentTimeline)
    }
  }

  cancelDelete = e => {
    e.stopPropagation()
    this.setState({deleting: false})
  }

  handleDelete = e => {
    e.stopPropagation()
    this.setState({deleting: true, hovering: false})
  }

  editTitle = () => {
    const id = this.props.chapter.id
    const ref = findDOMNode(this.refs.titleRef)
    if (!ref) return null

    if (this.props.isSeries) {
      if (ref.value == '') return null // don't allow nothing
      this.props.beatActions.editBeatTitle(id, ref.value)
      this.setState({editing: false, hovering: false})
    } else {
      // if nothing, set to auto
      this.props.actions.editSceneTitle(id, ref.value || 'auto')
      this.setState({editing: false, hovering: false})
    }
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
    if (event.which === 27) this.setState({editing: false})
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.chapter))
    this.setState({dragging: true})
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  handleDragEnter = (e) => {
    if (!this.state.dragging) this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    if (!this.state.dragging) this.setState({dropping: true})
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    if (!this.state.dragging) this.setState({dropping: false})
  }

  handleDrop = (e) => {
    e.stopPropagation()
    if (this.state.dragging) return
    this.setState({dropping: false})

    var json = e.dataTransfer.getData('text/json')
    var droppedChapter = JSON.parse(json)
    if (droppedChapter.id == null) return
    if (droppedChapter.id == this.props.chapter.id) return

    this.props.handleReorder(this.props.chapter.position, droppedChapter.position)
  }

  startEditing = () => {
    this.setState({editing: true})
  }

  startHovering = () => {
    this.setState({hovering: true})
  }

  stopHovering = () => {
    this.setState({hovering: false})
  }

  renderDelete () {
    if (!this.state.deleting) return null

    return <DeleteConfirmModal name={this.props.chapterTitle} onDelete={this.deleteChapter} onCancel={this.cancelDelete}/>
  }

  renderHoverOptions () {
    var style = {visibility: 'hidden'}
    if (this.state.hovering) style.visibility = 'visible'
    if (this.props.ui.orientation === 'vertical') {
      return (
        <div className={orientedClassName('scene-list__item__hover-options', this.props.ui.orientation)} style={style}>
          <Button block onClick={this.startEditing}><Glyphicon glyph='edit' /></Button>
          <Button block onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </div>
      )
    } else {
      return (<div className={orientedClassName('scene-list__item__hover-options', this.props.ui.orientation)} style={style}>
        <ButtonGroup>
          <Button onClick={this.startEditing}><Glyphicon glyph='edit' /></Button>
          <Button onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </ButtonGroup>
      </div>)
    }
  }

  renderTitle () {
    const { chapter, chapterTitle, positionOffset, isSeries } = this.props
    if (!this.state.editing) return <span>{chapterTitle}</span>

    return (<FormGroup>
      <ControlLabel>{editingChapterLabel(chapter, positionOffset, isSeries)}</ControlLabel>
      <FormControl
        type='text'
        defaultValue={chapter.title}
        ref='titleRef'
        autoFocus
        onKeyDown={this.handleEsc}
        onBlur={this.handleBlur}
        onKeyPress={this.handleFinishEditing} />
    </FormGroup>)
  }

  render () {
    window.SCROLLWITHKEYS = !this.state.editing
    const { chapter, ui, positionOffset, isSeries } = this.props
    let innerKlass = orientedClassName('scene__body', ui.orientation)
    if (this.state.hovering) innerKlass += ' hover'
    if (this.state.dropping) innerKlass += ' dropping'
    return <Cell>
      <div
        className={orientedClassName('scene__cell', ui.orientation)}
        title={chapterPositionTitle(chapter, positionOffset, isSeries)}
        onMouseEnter={this.startHovering}
        onMouseLeave={this.stopHovering}
        onDrop={this.handleDrop}>
        { this.renderHoverOptions() }
        { this.renderDelete() }
        <div className={innerKlass}
          onClick={this.startEditing}
          draggable={true}
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}>
          { this.renderTitle() }
        </div>
      </div>
    </Cell>
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
}

const makeMapState = (state) => {
  const uniqueChapterSelector = makeChapterSelector()
  const uniqueChapterTitleSelector = makeChapterTitleSelector()

  return function mapStateToProps (state, ownProps) {
    return {
      chapters: state.present.chapters,
      chapter: uniqueChapterSelector(state.present, ownProps.chapterId),
      ui: state.present.ui,
      isSeries: isSeriesSelector(state.present),
      chapterTitle: uniqueChapterTitleSelector(state.present, ownProps.chapterId),
      positionOffset: positionOffsetSelector(state.present),
    }
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(
  makeMapState,
  mapDispatchToProps
)(ChapterTitleCell)
