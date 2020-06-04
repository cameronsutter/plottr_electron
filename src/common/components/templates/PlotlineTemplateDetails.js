import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import _ from 'lodash'

export default class PlotlineTemplateDetails extends Component {

  renderData (type, data) {
    switch (type) {
      case 'chapters':
        return _.sortBy(data, 'position').map(ch => <li key={ch.id}>{ch.title}</li>)
      case 'cards':
        return _.sortBy(data, 'id').map(c => <li key={c.id}>{c.title}</li>)
      case 'lines':
        return _.sortBy(data, 'position').map(l => <li key={l.id}>{l.title}</li>)
      default:
        return null
    }
  }

  render () {
    const { template } = this.props
    const body = Object.keys(template.templateData)
      .filter(heading => heading != 'notes')
      .filter(heading => !template.templateData[heading].every(item => item.title == 'auto'))
      .map(heading => {
        let headingText = heading
        if (heading == 'lines') headingText = i18n('Plotlines')
        if (heading == 'cards') headingText = i18n('Scene Cards')
        if (heading == 'chapters') headingText = i18n('Chapters')

        return <div key={heading}>
          <h5 className='text-center text-capitalize'>{headingText}</h5>
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