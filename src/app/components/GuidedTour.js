import React, { Component } from 'react'
import Tour from 'reactour'
import SETTINGS from '../../settings'
import i18n from 'format-message'

export default class GuidedTour extends Component {
  state = {
    showTour: SETTINGS.get('showTheTour')
  }
  steps = [
    {selector: '', content: i18n('Since this is your first time using Plottr, I\'ll give you a guided tour if you like.')},
    {selector: '.insert-scene-wrapper.append-scene', content: i18n('Add new scenes or chapters here')},
    {selector: '.sticky-table-row:nth-child(1) .sticky-table-cell:nth-child(2) .scene-list__insert', content: i18n('Or hover here to insert between scenes')},
    {selector: '.sticky-table-row:nth-child(2)', content: i18n('This is a plotline')},
    {
      selector: '.sticky-table-row:nth-child(2) .sticky-table-cell:nth-child(1) .line-title__cell',
      content: i18n('You can change it\'s name or color by hovering over it (disabled for the tour)'),
      stepInteraction: false,
    },
    {selector: '.sticky-table-row:nth-child(3) .sticky-table-cell:nth-child(1) .line-list__append-line', content: i18n('Add more here')},
    {selector: '.nav.navbar-nav li:nth-child(2)', content: i18n('See the outline here')},
    {selector: '.nav.navbar-nav li:nth-child(3)', content: i18n('Here there is space for notes (brainstorming, world-building, etc.)')},
  ]

  closeTheTour = () => {
    // SETTINGS.set('showTheTour', false)
    console.log('closing!')
  }

  render () {
    return <Tour
      steps={this.steps}
      accentColor='#f9703e'
      className='tour-helper'
      closeWithMask={false}
      rounded={4}
      isOpen={this.state.showTour}
      onBeforeClose={this.closeTheTour}
      onRequestClose={() => this.setState({showTour: false})}/>
  }
}