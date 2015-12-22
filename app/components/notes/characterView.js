import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class CharacterView extends Component {

  render () {
    return (
      <div className='character'>
        <h4>{this.props.character.name}</h4>
        <p>{this.props.character.description}</p>
      </div>
    )
  }
}

CharacterView.propTypes = {
  character: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterView)
