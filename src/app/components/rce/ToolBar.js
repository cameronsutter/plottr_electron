import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { ButtonToolbar } from 'react-bootstrap'

export default class ToolBar extends Component {
  render () {
    return <ButtonToolbar>
      {this.props.children}
    </ButtonToolbar>
  }

  static propTypes = {
    children: PropTypes.array,
  }
}