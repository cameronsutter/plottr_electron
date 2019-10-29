import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as UIActions from 'actions/ui'
import { Glyphicon, FormControl, Button } from 'react-bootstrap'
import HistoryComponent from 'components/history/historyComponent'
import i18n from 'format-message'
const { ipcRenderer } = require('electron')
var TRIALMODE = process.env.TRIALMODE === 'true'

class Navigation extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false, showHistory: false}
  }

  toggleShowHistory = () => {
    this.setState({showHistory: !this.state.showHistory})
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
    } else {
      window.SCROLLWITHKEYS = true
    }
    let klasses = 'navbar navbar-default navbar-fixed-top'
    if (this.props.ui.darkMode) {
      klasses += ' navbar-inverse'
    }
    let buyItem = null
    if (TRIALMODE) {
      buyItem = <li>
        <a href='#' style={{color: 'hsl(210, 83%, 53%)'}} onClick={() => ipcRenderer.send('open-buy-window')} ><Glyphicon glyph='shopping-cart' /> {i18n('Buy Full Version')}</a>
      </li>
    }
    return (
      <div>
        <nav className={klasses} role='navigation'>
          <div className='collapse navbar-collapse'>
            <div className='navbar-header'>
              <button type='button' className='navbar-toggle' data-toggle='collapse' data-target='#navbar-collapse-1'>
                <span className='sr-only'>{i18n('Toggle navigation')}</span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
              </button>
              {this.renderStoryName()}
            </div>
            <ul className='nav navbar-nav'>
              <li className={this.isActive('timeline')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('timeline')} >{i18n('Timeline')}</a>
              </li>
              <li className={this.isActive('outline')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('outline')} >{i18n('Outline')}</a>
              </li>
              <li className={this.isActive('notes')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('notes')} >{i18n('Notes')}</a>
              </li>
              <li className={this.isActive('characters')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('characters')} >{i18n('Characters')}</a>
              </li>
              <li className={this.isActive('places')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('places')} >{i18n('Places')}</a>
              </li>
              <li className={this.isActive('tags')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('tags')} >{i18n('Tags')}</a>
              </li>
              { buyItem }
            </ul>
            <div className='navbar-form navbar-right' style={{marginRight: '15px'}}>
              <Button onClick={this.toggleShowHistory}><Glyphicon glyph='erase' /> {i18n('Undo')}...</Button>
              <HistoryComponent show={this.state.showHistory} />
            </div>
          </div>
        </nav>
      </div>
    )
  }

  saveEdit = () => {
    var newName = ReactDOM.findDOMNode(this.refs.storyNameInput).value
    this.props.actions.changeStoryName(newName)
    this.setState({editing: false})
  }

  handleFinishEditing = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  handleCancelEdit = (event) => {
    if (event.which === 27) {
      this.setState({editing: false})
    }
  }

  renderStoryName () {
    return this.state.editing ? this.renderEditingStoryName() : this.renderDisplayStoryName()
  }

  renderEditingStoryName () {
    return <FormControl
      className='navbar-brand story-name__input'
      type='text'
      defaultValue={this.props.storyName}
      ref='storyNameInput'
      autoFocus
      onBlur={this.saveEdit}
      onKeyDown={this.handleCancelEdit}
      onKeyPress={this.handleFinishEditing} />
  }

  renderDisplayStoryName () {
    return <a className='navbar-brand' onClick={() => this.setState({editing: true})} >{this.props.storyName}</a>
  }

  isActive (currentLink) {
    if (currentLink === this.props.ui.currentView) {
      return 'active'
    }
  }
}

Navigation.propTypes = {
  storyName: PropTypes.string.isRequired,
  ui: PropTypes.object.isRequired,
  file: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    file: state.file,
    storyName: state.storyName,
    ui: state.ui,
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
