import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import MarkDown from 'pagedown'
import _ from 'lodash'

const md = MarkDown.getSanitizingConverter()

class CardView extends Component {
  line () {
    return _.find(this.props.lines, 'id', this.props.card.lineId)
  }

  render () {
    const { title, description } = this.props.card
    var line = this.line()
    return (
      <div className='outline__card'>
        <div className='outline__card__line-title'>{line.title}</div>
        <h6>{title}</h6>
        <div
          dangerouslySetInnerHTML={{__html: md.makeHtml(description)}} >
        </div>
      </div>
    )
  }
}

CardView.propTypes = {
  card: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView)
