import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  saveEdit () {
    var newName = this.refs.nameInput.getValue() || this.props.place.name
    var newDescription = this.refs.descriptionInput.getValue() || this.props.place.description
    this.props.actions.editPlace(this.props.place.id, newName, newDescription)
    this.setState({editing: false})
  }

  renderEditing () {
    return (
      <div className='place'>
        <Input type='text' ref='nameInput' label='place name' defaultValue={this.props.place.name} />
        <Input type='text' ref='descriptionInput' label='place description' defaultValue={this.props.place.description} />
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

  renderPlace () {
    return (
      <div className='place' onClick={() => this.setState({editing: true})}>
        <h4>{this.props.place.name}</h4>
        <p>{this.props.place.description}</p>
      </div>
    )
  }

  render () {
    return this.state.editing ? this.renderEditing() : this.renderPlace()
  }
}

PlaceView.propTypes = {
  place: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceView)
