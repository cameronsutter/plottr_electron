import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { Cell } from 'react-sticky-table'
import * as SceneActions from 'actions/scenes'
import * as BeatActions from 'actions/beats'
import orientedClassName from 'helpers/orientedClassName'
import i18n from 'format-message'
import { chapterTitle, editingChapterLabel } from '../../helpers/chapters'

class ChapterTitleCell extends Component {
  constructor (props) {
    super(props)
    let editing = props.chapter.title == ''
    this.state = {hovering: false, editing: editing, dragging: false, dropping: false}
  }

  isSeries = () => {
    return this.props.ui.currentTimeline == 'series'
  }

  editTitle = () => {
    const id = this.props.chapter.id
    const ref = ReactDOM.findDOMNode(this.refs.titleRef)
    if (!ref) return null

    if (this.isSeries()) {
      if (ref.value != '') {
        this.props.beatActions.editBeatTitle(id, ref.value)
        this.setState({editing: false, hovering: false})
      }
    } else {
      this.props.actions.editSceneTitle(id, ref.value)
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

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.chapter))
    this.setState({dragging: true})
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    this.setState({dropping: true})
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.setState({dropping: false})
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({dropping: false})

    var json = e.dataTransfer.getData('text/json')
    var droppedChapter = JSON.parse(json)
    if (droppedChapter.id == null) return

    this.props.handleReorder(this.props.chapter.position, droppedChapter.position)
  }

  handleDelete = () => {
    let label = i18n("Do you want to delete this chapter: { title }?", {title: chapterTitle(this.props.chapter)})
    if (window.confirm(label)) {
      if (this.isSeries()) {
        this.props.beatActions.deleteBeat(this.props.chapter.id)
      } else {
        this.props.actions.deleteScene(this.props.chapter.id, this.props.ui.currentTimeline)
      }
    }
  }

  renderHoverOptions () {
    var style = {visibility: 'hidden'}
    if (this.state.hovering) style.visibility = 'visible'
    if (this.props.ui.orientation === 'vertical') {
      return (
        <div className={orientedClassName('scene-list__item__hover-options', this.props.ui.orientation)} style={style}>
          <Button block onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
          <Button block onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </div>
      )
    } else {
      return (<div className={orientedClassName('scene-list__item__hover-options', this.props.ui.orientation)} style={style}>
        <ButtonGroup>
          <Button onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
          <Button onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </ButtonGroup>
      </div>)
    }
  }

  renderTitle () {
    const { chapter } = this.props
    if (!this.state.editing) return <span>{chapterTitle(chapter, this.isSeries())}</span>

    return (<FormGroup>
      <ControlLabel>{editingChapterLabel(chapter, this.isSeries())}</ControlLabel>
      <FormControl
        type='text'
        defaultValue={chapter.title}
        ref='titleRef'
        autoFocus
        onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
        onBlur={this.handleBlur}
        onKeyPress={this.handleFinishEditing} />
    </FormGroup>)
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
    } else {
      window.SCROLLWITHKEYS = true
    }
    let innerKlass = orientedClassName('scene__body', this.props.ui.orientation)
    if (this.state.hovering) innerKlass += ' hover'
    if (this.state.dropping) innerKlass += ' dropping'
    return <Cell>
      <div
        className={orientedClassName('scene__cell', this.props.ui.orientation)}
        title={i18n('Chapter {number}', {number: this.props.chapter.position + 1})}
        onClick={() => this.setState({editing: true})}
        onMouseEnter={() => this.setState({hovering: true})}
        onMouseLeave={() => this.setState({hovering: false})}
        onDrop={this.handleDrop}>
        { this.renderHoverOptions() }
        <div className={innerKlass}
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
  chapter: PropTypes.object.isRequired,
  handleReorder: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  beatActions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  chapters: PropTypes.array,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    chapters: state.chapters,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterTitleCell)
