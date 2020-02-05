import React, { Component } from 'react'
import { ipcRenderer, shell } from 'electron'
import i18n from 'format-message'

export default class AdView extends Component {
  state = {
    countdown: 15, //if this changes, you have to change the animation length in expired_window.css.scss
    timesUp: false
  }
  interval = null

  componentDidMount () {
    // start the countdown
    this.interval = setInterval(this.decrementCountdown, 1000)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  decrementCountdown = () => {
    let val = this.state.countdown
    let timesUp = --val === 0
    if (timesUp) {
      ipcRenderer.send('extend-trial', 5)
    }
    this.setState({countdown: val, timesUp})
  }

  handleAdClick = () => {
    shell.openExternal('https://www.booksweeps.com/')
  }

  renderAd () {
    return <div className='ad__wrapper' onClick={this.handleAdClick}>
      <img width="40%" src="https://www.booksweeps.com/wp-content/uploads/2019/10/BookSweeps-Logo-6-6.png"/>
      <p>THE SMART &amp; EASY WAY TO BUILD AN AUDIENCE FOR YOUR BOOKS</p>
      <img width="40%" src="https://www.booksweeps.com/wp-content/uploads/2019/10/BookSweeps-effect-Illustration-V5.png"/>
    </div>
  }

  renderCountdown () {
    if (this.state.timesUp) return null

    return <div className='ad__countdown'>
      <div className="ad__countdown-number">{this.state.countdown}</div>
      <svg>
        <circle r="18" cx="20" cy="20"></circle>
      </svg>
    </div>
  }

  render () {
    return <div>
      { this.renderCountdown() }
      <p>{i18n('You can have 5 more days to try Plottr')} 🎉</p>
      <hr className='ad__hr'/>
      { this.renderAd() }
    </div>
  }
}