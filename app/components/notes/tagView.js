import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input } from 'react-bootstrap'
import * as TagActions from 'actions/tags'

class TagView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  saveEdit () {
    var newTitle = this.refs.titleInput.getValue() || this.props.tag.title
    this.props.actions.editTag(this.props.tag.id, newTitle)
    this.setState({editing: false})
  }

  renderEditing () {
    return (
      <div className='character'>
        <Input type='text' ref='titleInput' label='tag name' placeholder={this.props.tag.title} />
        <ButtonToolbar>
          <Button bsStyle='danger'
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
      <div className='tag' onClick={() => this.setState({editing: true})}>
        <h6>{this.props.tag.title}</h6>
      </div>
    )
  }

  render () {
    return this.state.editing ? this.renderEditing() : this.renderTag()
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
