import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import _ from 'lodash'
import { template, selectors } from 'pltr/v2'
import { remote } from 'electron'
import { isEmpty } from 'lodash'

const { lineFromTemplate } = template
const { app } = remote

export default class PlotlineTemplateDetails extends Component {
  headingMap = {
    lines: i18n('Plotlines'),
    cards: i18n('Scene Cards'),
    beats: i18n('Chapters'),
  }

  constructor(props) {
    super(props)

    this.state = {
      template: {},
      migrating: false,
    }
  }

  migrateTemplate = () => {
    lineFromTemplate(this.props.template, app.getVersion(), '', (error, template) => {
      if (error) {
        // Allow the top level ErrorBoundary to handle the error
        throw new Error(error)
      }
      this.setState({
        template: {
          id: template.id,
          lines: template.lines,
          cards: template.cards,
          beats: template.beats,
        },
      })
    })
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

  componentDidMount() {
    this.migrateTemplate()
  }

  componentDidUpdate() {
    if (this.state.template.id === this.props.template.id || isEmpty(this.state.template)) return

    this.setState({
      template: {},
    })

    this.migrateTemplate()
  }

  render() {
    const { template } = this.state
    const beatsToRender = isEmpty(template) ? null : selectors.templateBeatsForBookOne(template)
    const beatEntry = (
      <div key="beats">
        <h5 className="text-center text-capitalize">Beats</h5>
        <ol>{this.renderData('beats', beatsToRender)}</ol>
      </div>
    )
    const body = Object.keys(template)
      .filter((heading) => heading !== 'id' && heading !== 'beats')
      .filter((heading) => !template[heading].every((item) => item.title == 'auto'))
      .map((heading) => {
        let headingText = this.headingMap[heading] || heading

        return (
          <div key={heading}>
            <h5 className="text-center text-capitalize">{headingText}</h5>
            <ol>{this.renderData(heading, template[heading])}</ol>
          </div>
        )
      })
      .concat([beatEntry])

    return <div className="panel-body">{body}</div>
  }

  static propTypes = {
    template: PropTypes.object.isRequired,
  }
}
