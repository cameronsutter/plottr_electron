import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import _ from 'lodash'

export default class PlotlineTemplateDetails extends Component {

  renderData (type, data) {
    switch (type) {
      case "scenes":
        return _.sortBy(data, 'position').map(sc => {
          return <li key={sc.id}>{sc.title}</li>
        })
      case "cards":
        return data.map(c => {
          return <li key={c.id}>{c.title}</li>
        })
      default:
        return null
    }
  }

  render () {
    const { template } = this.props
    const body = Object.keys(template.templateData).map(heading => {
      return <div key={heading}>
        <h5 className='text-center text-capitalize'>{heading}</h5>
        <ol>
          {this.renderData(heading, template.templateData[heading])}
        </ol>
      </div>
    })

    return <div className='panel-body'>
      {body}
    </div>
  }

  static propTypes = {
    template: PropTypes.object.isRequired
  }
}