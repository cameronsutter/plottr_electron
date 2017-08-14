import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeleteCharacter extends Component {

  render () {
    const item = this.props.item
    var character = _.find(item.before.characters, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>card: "{character.title}"</span>
        <p>Before: <span className='history-component__item__before'>{character.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeleteCharacter.propTypes = {
  item: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    characters: state.characters
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteCharacter)
