import React, { Component, PropTypes } from 'react'

class Navigation extends Component {
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
            <a className='navbar-brand'>{this.props.storyName || 'Plottr'}</a>
          </div>
          <div className='collapse navbar-collapse'>
            <ul className='nav navbar-nav'>
              <li className={this.isActive('timeline')}>
                <a href='#' onClick={() => this.props.changeView('timeline')} >Timeline</a>
              </li>
              <li className={this.isActive('notes')}>
                <a href='#' onClick={() => this.props.changeView('notes')} >Notes</a>
              </li>
              <li className={this.isActive('outline')}>
                <a href='#' onClick={() => this.props.changeView('outline')} >Outline</a>
              </li>
              <li className={this.isActive('slides')}>
                <a href='#' onClick={() => this.props.changeView('slides')} >Slides</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    )
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
  changeView: PropTypes.func.isRequired
}

export default Navigation
