import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeletePlace extends Component {
  render() {
    const item = this.props.item
    var place = _.find(item.before.places, { id: item.action.id }) || { title: '' }
    return (
      <div>
        <span>
          {i18n('Place')}: &quot;{place.title}&quot;
        </span>
        <p>
          {i18n('Before')}: <span className="history-component__item__before">{place.title}</span>
        </p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

DeletePlace.propTypes = {
  item: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    places: state.places,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeletePlace)
