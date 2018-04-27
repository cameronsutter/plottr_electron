import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import i18n from 'format-message'

class RemoveCustomAttribute extends Component {

  render () {
    const item = this.props.item
    let label = ''
    if (item.action.type.includes('PLACES')) {
      label = i18n('custom place attribute')
    } else {
      label = i18n('custom character attribute')
    }

    return (
      <div>
        <span>{label}</span>
        <p>{i18n('Before')}: <span className='history-component__item__before'>{item.action.attribute}</span></p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

RemoveCustomAttribute.propTypes = {
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
)(RemoveCustomAttribute)
