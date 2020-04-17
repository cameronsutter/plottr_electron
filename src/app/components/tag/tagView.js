import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, ButtonGroup, Button, FormControl, FormGroup,
  ControlLabel, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import * as TagActions from 'actions/tags'
import i18n from 'format-message'

class TagView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.tag.title === '', showColorPicker: false}
  }

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
  }

  handleCancel = () => {
    this.setState({editing: false})
    if (this.props.tag.title == '') {
      this.props.actions.deleteTag(this.props.tag.id)
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

  saveEdit () {
    let { title, id, color } = this.props.tag
    var newTitle = findDOMNode(this.refs.titleInput).value || title
    this.props.actions.editTag(id, newTitle, color)
    this.setState({editing: false})
  }

  deleteTag = () => {
    let label = i18n("Do you want to delete this tag: { title }?", {title: this.props.tag.title})
    if (window.confirm(label)) {
      this.props.actions.deleteTag(this.props.tag.id)
    }
  }

  changeColor = (color) => {
    let { id, title } = this.props.tag
    this.props.actions.editTag(id, title, color)
    this.setState({showColorPicker: false})
  }

  renderColorPicker () {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.tag.id
      return <ColorPicker key={key} darkMode={this.props.ui.darkMode} color={this.props.tag.color} closeDialog={this.changeColor} />
    } else {
      return null
    }
  }

  renderEditing () {
    const { tag } = this.props
    return (
      <div onKeyDown={this.handleEsc}>
        <FormGroup>
          <ControlLabel>{i18n('tag name')}</ControlLabel>
          <FormControl type='text' ref='titleInput' autoFocus
            onKeyDown={this.handleEsc}
            onKeyPress={this.handleEnter}
            defaultValue={tag.title} />
        </FormGroup>
        {this.renderColorPicker()}
        <ButtonGroup>
          <DropdownButton title={i18n("Actions")} id="bg-nested-dropdown">
            <MenuItem onClick={() => this.setState({showColorPicker: true})}><Glyphicon glyph='tint' /> {i18n('Choose color')}</MenuItem>
            <MenuItem onClick={() => this.changeColor(null)}><Glyphicon glyph='ban-circle' /> {i18n('No color')}</MenuItem>
            <MenuItem onClick={this.deleteTag}><Glyphicon glyph='trash' /> {i18n('Delete')}</MenuItem>
          </DropdownButton>
          <Button onClick={this.handleCancel}>{i18n('Cancel')}</Button>
        </ButtonGroup>
      </div>
    )
  }

  renderTag () {
    return <div
        onClick={() => this.setState({editing: true})}
        className='tag-list__tag-normal'
      >
      <h6>{this.props.tag.title}</h6>
      {this.renderColorPicker()}
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
    let styles = {}
    if (this.props.tag.color) styles = {border: `2px solid ${this.props.tag.color}`}
    let klasses = 'tag-list__tag'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className={klasses} style={styles}>
        {body}
      </div>
    )
  }
}

TagView.propTypes = {
  tag: PropTypes.object.isRequired,
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
