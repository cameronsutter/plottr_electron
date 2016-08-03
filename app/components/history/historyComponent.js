import React, { Component, PropTypes } from 'react'
import configureStore from 'store/configureStore'
import { connect } from 'react-redux'
// import { Glyphicon, Input, Button } from 'react-bootstrap'
import HistoryItem from 'components/history/historyItem'

class HistoryComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {history: [], changesToIgnore: []}
  }

  componentWillReceiveProps (newProps) {
    var json = JSON.parse(window.localStorage.getItem('history'))
    this.setState({history: json})
  }

  undo (index) {
    console.log('before', this.state.changesToIgnore)
    this.setState({changesToIgnore: this.state.changesToIgnore.push(index)})
    console.log('after', this.state.changesToIgnore)
    const store = configureStore({})
    // rollback each change up until and including the index
    for (var i = 0; i <= index; i++) {
      var change = this.state.history[i]
      console.log(change)
    }
    // walk back up the list and redo each change lower than index
    for (i = index - 1; i >= 0; i--) {
      change = this.state.history[i]

    }
  }

  redo (index) {

  }

  renderHistoryItems () {
    if (this.state.history.length === 0) return <span>No actions to undo</span>
    return this.state.history.map((item, index) => {
      return <HistoryItem key={index} item={item} index={index} undo={this.undo.bind(this)} redo={this.redo.bind(this)} />
    })
  }

  render () {
    var style = this.props.show ? {display: 'flex'} : {}
    return (
      <div className='history-component__container' style={style}>
        {this.renderHistoryItems()}
      </div>
    )
  }
}

HistoryComponent.propTypes = {
  show: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoryComponent)
