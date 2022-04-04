import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import Label from 'reeact-bootstrap/Label'
import { helpers } from 'pltr/v2'

const {
  colors: { getContrastYIQ },
} = helpers

class TagLabel extends Component {
  render() {
    const { tag } = this.props
    let style = {
      backgroundColor: 'white',
      color: '#16222d',
      border: '1px solid #16222d',
    }

    if (tag.color) {
      const [useBlack, value] = getContrastYIQ(tag.color)
      if (useBlack) style.backgroundColor = tag.color
      else style = { backgroundColor: tag.color }

      if (value < 200) style.border = 'none'
    }

    return (
      <Label bsStyle="info" style={style}>
        {tag.title}
      </Label>
    )
  }
}

TagLabel.propTypes = {
  tag: PropTypes.object.isRequired,
}

export default TagLabel
