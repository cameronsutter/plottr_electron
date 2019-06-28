import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class AddCustomAttribute extends Component {

  render () {
    const item = this.props.item
    let label = item.action.type.indexOf('PLACES') === -1 ? i18n('character') : i18n('place')
    return (
      <div>
        <span>new custom {label} attribute</span>
        <p>{i18n('Before')}: </p>
        <p>{i18n('After')}: <span className='history-component__item__after'>{item.action.attribute}</span></p>
      </div>
    )
  }
}

AddCustomAttribute.propTypes = {
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
)(AddCustomAttribute)
