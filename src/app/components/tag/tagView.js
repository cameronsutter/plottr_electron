import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input, Label, Glyphicon } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import * as TagActions from 'actions/tags'

class TagView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.tag.title === '', showColorPicker: false, newColor: null}
  }

  handleEnter (event) {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  saveEdit () {
    var newTitle = this.refs.titleInput.getValue() || this.props.tag.title
    var newColor = this.state.newColor || this.props.tag.color
    this.props.actions.editTag(this.props.tag.id, newTitle, newColor)
    this.setState({editing: false})
  }

  changeColor (color) {
    this.setState({showColorPicker: false, newColor: color})
  }

  renderColorPicker () {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.tag.id
      return <ColorPicker key={key} closeDialog={this.changeColor.bind(this)} />
    } else {
      return null
    }
  }

  renderColorLabel (color) {
    var colorLabel = null
    if (color) {
      var style = {backgroundColor: color}
      colorLabel = <Label bsStyle='info' style={style}>{color}</Label>
    }
    return <span>{colorLabel || ''}</span>
  }

  renderEditing () {
    const { tag } = this.props
    return (
      <div className='tag-list__tag'>
        <Input type='text' ref='titleInput' autoFocus
          onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
          onKeyPress={this.handleEnter.bind(this)}
          label='tag name' defaultValue={tag.title} />
        <Button onClick={() => this.setState({showColorPicker: true, newColor: null})} ><Glyphicon glyph='tint' /></Button>
        {this.renderColorPicker()}
        <div className='form-group tag-list__color-label'><label className='control-label'>Current color: {this.renderColorLabel(tag.color)}</label></div>
        <div className='form-group tag-list__color-label'><label className='control-label'>New color: {this.renderColorLabel(this.state.newColor)}</label></div>
        <hr />
        <ButtonToolbar>
          <Button
            onClick={() => this.setState({editing: false})} >
            Cancel
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit.bind(this)} >
            Save
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  renderTag () {
    return (
      <div className='tag-list__tag' onClick={() => this.setState({editing: true})}>
        <h6>{this.props.tag.title} {this.renderColorLabel(this.props.tag.color)}</h6>
      </div>
    )
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
      return this.renderEditing()
    } else {
      window.SCROLLWITHKEYS = true
      return this.renderTag()
    }
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
