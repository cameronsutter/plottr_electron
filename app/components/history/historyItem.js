import React, { Component, PropTypes } from 'react'
// import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Glyphicon, Button } from 'react-bootstrap'
import * as types from 'constants/ActionTypes'
import StoryName from 'components/history/StoryName'
import CardDetails from 'components/history/CardDetails'

class HistoryItem extends Component {
  constructor (props) {
    super(props)
    this.state = {showDetails: false, redo: false}
  }

  toggleDetails (e) {
    this.setState({showDetails: !this.state.showDetails})
  }

  undo (e) {
    e.stopPropagation()
    this.setState({redo: true})
    this.props.undo(this.props.index)
  }

  redo (e) {
    e.stopPropagation()
    this.setState({redo: false})
    this.props.redo(this.props.index)
  }

  renderTypeName (type) {
    return type.replace(/_/g, ' ').toLowerCase()
  }

  renderButton () {
    var style = this.state.showDetails ? {alignSelf: 'flex-start'} : {}
    if (this.state.redo) {
      return <Button bsStyle='primary' bsSize='small' style={style} onClick={this.redo.bind(this)}>
        <Glyphicon glyph='repeat' /> Redo</Button>
    } else {
      return <Button bsStyle='danger' bsSize='small' style={style} onClick={this.undo.bind(this)}>
        <Glyphicon glyph='remove' /> Undo</Button>
    }
  }

  renderDetailsByType (type, item) {
    var details = null
    switch (type) {
      case types.EDIT_STORY_NAME:
        details = <StoryName item={item} />
        break
      case types.EDIT_CARD_DETAILS:
        details = <CardDetails item={item} />
        break
      default:
        details = <div>{type}</div>
    }
    return details
  }

  render () {
    const type = this.props.item.action.type
    var details = this.renderDetailsByType(type, this.props.item)
    var button = this.renderButton()
    var detailStyle = this.state.showDetails ? {display: 'block'} : {}
    var containerClass = 'history-component__item__container'
    containerClass = this.state.redo ? `${containerClass} redo` : containerClass
    return (
      <div className='history-component__item' onClick={this.toggleDetails.bind(this)}>
        <div className={containerClass}>
          <div className='history-component__type'><strong>{this.renderTypeName(type)}</strong></div>
          <div className='history-component__details' style={detailStyle} >{details}</div>
        </div>
        {button}
      </div>
    )
  }
}

HistoryItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired
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
)(HistoryItem)
