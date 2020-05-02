import React, { Component } from 'react'
import Tour from 'reactour'
import SETTINGS from '../../common/utils/settings'
import i18n from 'format-message'

export default class GuidedTour extends Component {
  state = {
    showTour: true
  }

  steps = [
    {selector: '', content: i18n('Since this is your first time using Plottr, I\'ll give you a guided tour if you like.')},
    {selector: '.sticky-table-row:nth-child(1) .sticky-table-cell:nth-child(3) .scene__body', content: i18n('This is a scene or chapter. You can change its name by clicking on it')},
    {selector: '.insert-scene-wrapper.append-scene', content: i18n('Add new scenes or chapters here')},
    {selector: '.sticky-table-row:nth-child(1) .sticky-table-cell:nth-child(2) .scene-list__insert', content: i18n('Or hover here to insert between scenes')},
    {selector: '.sticky-table-row:nth-child(2)', content: i18n('This is a plotline')},
    {
      selector: '.sticky-table-row:nth-child(2) .sticky-table-cell:nth-child(1) .line-title__cell',
      content: i18n('You can change it\'s name or color by hovering over it (disabled for the tour)'),
      stepInteraction: false,
    },
    {selector: '.sticky-table-row:nth-child(2) .sticky-table-cell:nth-child(3) .card__cell', content: i18n('Add cards to the timeline so you can write notes about your scenes. Click on the card to add more details')},
    {selector: '.sticky-table-row:nth-child(3) .sticky-table-cell:nth-child(1) .line-list__append-line', content: i18n('Add more plotlines here')},
    {selector: '.subnav__container .container ul li:nth-child(5)', content: i18n('You can export everything to a Word document')},
    {selector: '.nav.navbar-nav li:nth-child(3)', content: i18n('See the outline here')},
    {selector: '.nav.navbar-nav li:nth-child(4)', content: i18n('Keep all your notes here (brainstorming, world-building, etc.)')},
    {selector: '.nav.navbar-nav li:nth-child(5)', content: i18n('Keep your character sheets here')},
    {selector: '.nav.navbar-nav li:nth-child(6)', content: i18n('Keep info about your locations here')},
    {selector: '.nav.navbar-nav li:nth-child(7)', content: i18n('Tags can be used for organization')},
  ]

  closeTheTour = () => {
    SETTINGS.set('showTheTour', false)
    this.setState({showTour: false})
  }

  render () {
    return <Tour
      isOpen={this.state.showTour}
      steps={this.steps}
      accentColor='#f9703e'
      className='tour-helper'
      closeWithMask={false}
      rounded={4}
      onBeforeClose={this.closeTheTour}
      onRequestClose={() => this.setState({showTour: false})}
      lastStepNextButton={<div className='btn btn-success'>{i18n('Done')}</div>}
    />
  }
}