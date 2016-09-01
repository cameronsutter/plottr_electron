import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import deep from 'deep-diff'
import _ from 'lodash'
import storageKey from 'middlewares/helpers'
import * as UndoActions from 'actions/undo'
// import { Glyphicon, Input, Button } from 'react-bootstrap'
import HistoryItem from 'components/history/historyItem'

class HistoryComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {history: this.readHistory(), changesToIgnore: []}
  }

  componentWillReceiveProps (newProps) {
    this.setState({history: this.readHistory()})
  }

  readHistory () {
    return JSON.parse(window.localStorage.getItem(storageKey(this.props.file.fileName))) || []
  }

  undo (changeId) {
    var toIgnore = this.state.changesToIgnore
    toIgnore.push(changeId)
    this.setState({toIgnore: toIgnore})

    this.applyChanges()
  }

  redo (changeId) {
    var toIgnore = this.state.changesToIgnore
    toIgnore.splice(toIgnore.indexOf(changeId), 1)
    this.setState({changesToIgnore: toIgnore})

    this.applyChanges()
  }

  applyChanges () {
    var toIgnore = this.state.changesToIgnore
    var history = this.state.history
    if (toIgnore.length > 0) {
      // get the change that has the lowest index
      var lowestIndex = history.length
      toIgnore.forEach((id) => {
        var index = _.findIndex(history, {id: id})
        if (index < lowestIndex) lowestIndex = index
      })
      var change = history[lowestIndex]
      // rollback to before the first change to ignore
      var newState = _.cloneDeep(change.before)
      // walk down the list and apply the diff for each change
      for (var i = lowestIndex + 1; i < history.length; i++) {
        change = history[i]
        if (toIgnore.indexOf(change.id) === -1) {
          change.diff.forEach((d) => {
            deep.applyChange(newState, newState, d)
          })
        }
      }
    } else {
      newState = history[history.length - 1].after
    }
    this.props.actions.reset(newState)
  }

  renderHistoryItems () {
    if (this.state.history.length === 0) return <span>No actions to undo</span>
    return this.state.history.map((item, index) => {
      var hasBeenUndone = this.state.changesToIgnore.indexOf(item.id) !== -1
      return <HistoryItem key={index} item={item} undone={hasBeenUndone} undo={this.undo.bind(this)} redo={this.redo.bind(this)} />
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

// file is not used, but since it's here,
// and file:dirty changes everytime a change happens,
// it forces this to update everytime
HistoryComponent.propTypes = {
  show: PropTypes.bool.isRequired,
  file: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    file: state.file
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UndoActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoryComponent)
