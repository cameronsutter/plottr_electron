import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as UIActions from 'actions/ui'
import { Glyphicon, Input, Button } from 'react-bootstrap'
import HistoryComponent from 'components/history/historyComponent'

class Navigation extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false, showHistory: false}
  }

  toggleShowHistory () {
    this.setState({showHistory: !this.state.showHistory})
  }

  renderUnsavedChanges () {
    if (!this.props.file.dirty) return
    return <span className='alert alert-danger' role='alert'><Glyphicon glyph='exclamation-sign' /> unsaved changes</span>
  }

  render () {
    return (
      <div>
        <nav className='navbar navbar-default navbar-fixed-top' role='navigation'>
          <div className='navbar-header'>
            <button type='button' className='navbar-toggle' data-toggle='collapse' data-target='#navbar-collapse-1'>
              <span className='sr-only'>Toggle navigation</span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
            </button>
            {this.renderStoryName()}
          </div>
          <div className='collapse navbar-collapse'>
            <ul className='nav navbar-nav'>
              <li className={this.isActive('timeline')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('timeline')} >Timeline</a>
              </li>
              <li className={this.isActive('outline')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('outline')} >Outline</a>
              </li>
              <li className={this.isActive('characters')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('characters')} >Characters</a>
              </li>
              <li className={this.isActive('places')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('places')} >Places</a>
              </li>
              <li className={this.isActive('tags')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('tags')} >Tags</a>
              </li>
            </ul>
            <div className='navbar-form navbar-right' style={{marginRight: '15px'}}>
              <Button onClick={this.toggleShowHistory.bind(this)}><Glyphicon glyph='erase' /> Undo</Button>
              <HistoryComponent show={this.state.showHistory} />
            </div>
            <p className='navbar-text navbar-right' style={{marginRight: '15px'}}>
              {this.renderUnsavedChanges()}
            </p>
          </div>
        </nav>
      </div>
    )
  }

  handleFinishEditing (event) {
    if (event.which === 13) {
      var newName = this.refs.storyNameInput.getValue()
      this.props.actions.changeStoryName(newName)
      this.setState({editing: false})
    }
  }

  renderStoryName () {
    return this.state.editing ? this.renderEditingStoryName() : this.renderDisplayStoryName()
  }

  renderEditingStoryName () {
    return <Input
      type='text'
      placeholder={this.props.storyName}
      ref='storyNameInput'
      autoFocus
      onBlur={() => this.setState({editing: false})}
      onKeyPress={this.handleFinishEditing.bind(this)} />
  }

  renderDisplayStoryName () {
    return <a className='navbar-brand' onClick={() => this.setState({editing: true})} >{this.props.storyName}</a>
  }

  isActive (currentLink) {
    if (currentLink === this.props.currentView) {
      return 'active'
    }
  }
}

Navigation.propTypes = {
  storyName: PropTypes.string.isRequired,
  currentView: PropTypes.string.isRequired,
  file: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    file: state.file,
    storyName: state.storyName,
    currentView: state.ui.currentView
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation)
