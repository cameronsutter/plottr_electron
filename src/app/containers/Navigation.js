import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as UIActions from 'actions/ui'
import { Glyphicon, FormControl, Button } from 'react-bootstrap'
import HistoryComponent from 'components/history/historyComponent'
import BookChooser from '../components/story/BookChooser'
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
            </div>
            <ul className="nav navbar-nav" style={{marginLeft: '15px', marginRight: '10px'}}>
              <BookChooser />
            </ul>
            <ul className='nav navbar-nav'>
              <li className={this.isActive('story')}>
                <a href='#' onClick={() => this.props.actions.changeCurrentView('story')} >{i18n('Series')}</a>
              </li>
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
          </div>
        </nav>
      </div>
    )
  }

  isActive (currentLink) {
    if (currentLink === this.props.ui.currentView) {
      return 'active'
    }
  }
}

Navigation.propTypes = {
  ui: PropTypes.object.isRequired,
  file: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    file: state.file,
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
