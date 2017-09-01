import React, { Component, PropTypes } from 'react'
import { Label } from 'react-bootstrap'

class TagLabel extends Component {
  render () {
    const { tag } = this.props
    var style = {
      backgroundColor: 'white',
      color: '#16222d',
      border: '1px solid #16222d'
    }
    if (tag.color) style = {backgroundColor: tag.color}
    return <Label bsStyle='info' style={style}>{tag.title}</Label>
  }
}

TagLabel.propTypes = {
  tag: PropTypes.object.isRequired
}

export default TagLabel
