import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class Reorder extends Component {

  render () {
    const item = this.props.item
    let label = ''
    if (item.action.type.includes('SCENES')) {
      label = i18n('a lot of scenes moved around')
    } else {
      label = i18n('a lot of story lines moved around')
    }
    return (
      <div>
        <p>{label}</p>
      </div>
    )
  }
}

Reorder.propTypes = {
  item: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reorder)
