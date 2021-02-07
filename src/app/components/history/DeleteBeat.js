import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeleteBeat extends Component {
  render() {
    const item = this.props.item
    var beat = _.find(item.before.beats, { id: item.action.id }) || { title: '' }
    return (
      <div>
        <span>
          {i18n('Beat')}: &quot;{beat.title}&quot;
        </span>
        <p>
          {i18n('Before')}: <span className="history-component__item__before">{beat.title}</span>
        </p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

DeleteBeat.propTypes = {
  item: PropTypes.object.isRequired,
  beats: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    beats: state.beats,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteBeat)
