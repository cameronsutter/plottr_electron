import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ReactDOM from 'react-dom'
import { ButtonToolbar, ButtonGroup, Button, Input, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import * as TagActions from 'actions/tags'

class TagView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.tag.title === '', showColorPicker: false}
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  saveEdit () {
    let { title, id, color } = this.props.tag
    var newTitle = this.refs.titleInput.getValue() || title
    this.props.actions.editTag(id, newTitle, color)
    this.setState({editing: false})
  }

  deleteTag = () => {
    if (window.confirm(`Do you want to delete this tag: '${this.props.tag.title}'?`)) {
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
      return <ColorPicker key={key} color={this.props.tag.color} closeDialog={this.changeColor} />
    } else {
      return null
    }
  }

  renderEditing () {
    const { tag } = this.props
    return (
      <div onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
        >
        <Input type='text' ref='titleInput' autoFocus
          onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
          onKeyPress={this.handleEnter}
          label='tag name' defaultValue={tag.title} />
        {this.renderColorPicker()}
        <ButtonGroup>
          <DropdownButton title="Actions" id="bg-nested-dropdown">
            <MenuItem onClick={() => this.setState({showColorPicker: true})}><Glyphicon glyph='tint' /> Choose color</MenuItem>
            <MenuItem onClick={() => this.changeColor(null)}><Glyphicon glyph='ban-circle' /> No color</MenuItem>
            <MenuItem onClick={this.deleteTag}><Glyphicon glyph='trash' /> Delete</MenuItem>
          </DropdownButton>
          <Button onClick={() => this.setState({editing: false})} >Cancel</Button>
        </ButtonGroup>
      </div>
    )
  }

  renderTag () {
    return <div onClick={() => this.setState({editing: true})}>
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
    return (
      <div className='tag-list__tag' style={styles}>
        {body}
      </div>
    )
  }
}

TagView.propTypes = {
  tag: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
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
