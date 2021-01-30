import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeleteCharacter extends Component {
  render() {
    const item = this.props.item
    var character = _.find(item.before.characters, { id: item.action.id }) || { title: '' }
    return (
      <div>
        <span>
          {i18n('Character')}: &quot;{character.title}&quot;
        </span>
        <p>
          {i18n('Before')}:{' '}
          <span className="history-component__item__before">{character.title}</span>
        </p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

DeleteCharacter.propTypes = {
  item: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    characters: state.characters,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteCharacter)
