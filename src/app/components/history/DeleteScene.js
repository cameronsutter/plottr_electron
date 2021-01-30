import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeleteScene extends Component {
  render() {
    const item = this.props.item
    var scene = _.find(item.before.scenes, { id: item.action.id }) || { title: '' }
    return (
      <div>
        <span>
          {i18n('Scene')}: &quot;{scene.title}&quot;
        </span>
        <p>
          {i18n('Before')}: <span className="history-component__item__before">{scene.title}</span>
        </p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

DeleteScene.propTypes = {
  item: PropTypes.object.isRequired,
  scenes: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    scenes: state.scenes,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteScene)
