import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import _ from 'lodash'

export default class PlotlineTemplateDetails extends Component {
  headingMap = {
    lines: i18n('Plotlines'),
    cards: i18n('Scene Cards'),
    beats: i18n('Chapters'),
  }

  renderData(type, data) {
    switch (type) {
      case 'beats':
        return _.sortBy(data, 'position').map((beat) => <li key={beat.id}>{beat.title}</li>)
      case 'cards':
        return _.sortBy(data, 'id').map((c) => <li key={c.id}>{c.title}</li>)
      case 'lines':
        return _.sortBy(data, 'position').map((l) => <li key={l.id}>{l.title}</li>)
      default:
        return null
    }
  }

  render() {
    const { template } = this.props
    const body = Object.keys(template.templateData)
      .filter((heading) => heading != 'notes')
      .filter((heading) => !template.templateData[heading].every((item) => item.title == 'auto'))
      .map((heading) => {
        let headingText = this.headingMap[heading] || heading

        return (
          <div key={heading}>
            <h5 className="text-center text-capitalize">{headingText}</h5>
            <ol>{this.renderData(heading, template.templateData[heading])}</ol>
          </div>
        )
      })

    return <div className="panel-body">{body}</div>
  }

  static propTypes = {
    template: PropTypes.object.isRequired,
  }
}
