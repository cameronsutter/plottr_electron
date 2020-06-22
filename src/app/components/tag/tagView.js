import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, ButtonGroup, Button, FormControl, FormGroup,
  ControlLabel, Glyphicon } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import * as TagActions from 'actions/tags'
import i18n from 'format-message'
import cx from 'classnames'

class TagView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.tag.title === '', showColorPicker: false, hovering: false, color: null, deleting: false}
  }

  componentWillUnmount () {
    if (this.state.editing && !this.props.new) this.saveEdit()
  }

  deleteTag = e => {
    e.stopPropagation()
    this.props.actions.deleteTag(this.props.tag.id)
  }

  cancelDelete = e => {
    e.stopPropagation()
    this.setState({deleting: false})
  }

  handleDelete = e => {
    e.stopPropagation()
    this.setState({deleting: true})
  }

  handleCancel = () => {
    this.setState({editing: false})
    if (this.props.new) {
      this.props.doneCreating()
    }
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  handleEsc = (event) => {
    if (event.which === 27) {
      this.saveEdit()
    }
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

  saveEdit = () => {
    let { title, id, color } = this.props.tag
    var newTitle = findDOMNode(this.refs.titleInput).value || title
    if (this.props.new) {
      this.props.actions.addCreatedTag({title: newTitle, color: this.state.color})
      this.props.doneCreating()
    } else {
      this.props.actions.editTag(id, newTitle, color)
    }
    this.setState({editing: false})
  }

  changeColor = (color) => {
    if (this.props.new) {
      this.setState({color})
    } else {
      let { id, title } = this.props.tag
      this.props.actions.editTag(id, title, color)
    }
    this.setState({showColorPicker: false})
  }

  renderDelete () {
    if (!this.state.deleting) return null

    return <DeleteConfirmModal name={this.props.tag.title} onDelete={this.deleteTag} onCancel={this.cancelDelete}/>
  }

  renderColorPicker () {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.tag.id
      return <ColorPicker key={key} darkMode={this.props.ui.darkMode} color={this.props.tag.color || this.state.color} closeDialog={this.changeColor} />
    } else {
      return null
    }
  }

  renderEditing () {
    const { tag } = this.props
    return (
      <div onKeyDown={this.handleEsc}>
        <FormGroup>
          <ControlLabel>{i18n('Tag Name')}</ControlLabel>
          <FormControl type='text' ref='titleInput' autoFocus
            onKeyDown={this.handleEsc}
            onKeyPress={this.handleEnter}
            defaultValue={tag.title} />
        </FormGroup>
        {this.renderColorPicker()}
        <ButtonToolbar className='tag-list__tag__button-bar'>
          <Button bsStyle='success' onClick={this.saveEdit}>{i18n('Save')}</Button>
          <Button onClick={this.handleCancel}>{i18n('Cancel')}</Button>
        </ButtonToolbar>
      </div>
    )
  }

  renderHoverOptions () {
    const { color } = this.props.tag
    var style = {visibility: 'hidden'}
    if (this.state.hovering) style.visibility = 'visible'
    return <div className='tag-list__tag__hover-options' style={style}>
      <ButtonGroup>
        {this.props.new ? null : <Button title={i18n('Edit')} onClick={this.startEditing}><Glyphicon glyph='edit' /></Button>}
        <Button title={i18n('Choose color')} onClick={() => this.setState({showColorPicker: true})}><Glyphicon glyph='tint' /></Button>
        {color || this.state.color ? <Button bsStyle='warning' title={i18n('No color')} onClick={() => this.changeColor(null)}><Glyphicon glyph='ban-circle' /></Button>: null}
        {this.props.new ? null : <Button bsStyle='danger' title={i18n('Delete')} onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>}
      </ButtonGroup>
    </div>
  }

  renderTag () {
    return <div className='tag-list__tag-normal' onClick={this.startEditing}>
      <h6>{this.props.tag.title}</h6>
    </div>
  }

  render () {
    let body = null
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
      body = this.renderEditing()
    } else {
      window.SCROLLWITHKEYS = true
      body = this.renderTag()
    }
    const { tag, ui } = this.props
    let styles = {}
    if (tag.color) styles = {border: `2px solid ${tag.color}`}
    if (this.state.color) styles = {border: `2px solid ${this.state.color}`}
    return <div
      className='tag-list__tag-wrapper'
      onMouseEnter={this.startHovering}
      onMouseLeave={this.stopHovering}
    >
      { this.renderDelete() }
      { this.renderColorPicker() }
      { this.renderHoverOptions() }
      <div className={cx('tag-list__tag', {darkmode: ui.darkMode, editing: this.state.editing})} style={styles}>
        {body}
      </div>
    </div>
  }
}

TagView.propTypes = {
  tag: PropTypes.object.isRequired,
  new: PropTypes.bool,
  doneCreating: PropTypes.func,
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(TagActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TagView)
