import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import _ from 'lodash'
import { template } from 'pltr/v2'
import { isEmpty } from 'lodash'

import { checkDependencies } from '../checkDependencies'

const { lineFromTemplate } = template

const PlotlineTemplateDetailsConnector = (connector) => {
  const {
    platform: { appVersion },
    pltr: {
      selectors: { templateBeatsForBookOne },
    },
  } = connector
  checkDependencies({ appVersion, templateBeatsForBookOne })

  class PlotlineTemplateDetails extends Component {
    headingMap = {
      lines: t('Plotlines'),
      cards: t('Scene Cards'),
      beats: t('Chapters'),
    }

    constructor(props) {
      super(props)

      this.state = {
        template: {},
        migrating: false,
      }
    }

    migrateTemplate = () => {
      lineFromTemplate(this.props.template, appVersion, '', (error, template) => {
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
      const beatsToRender = isEmpty(template) ? null : templateBeatsForBookOne(template)
      const beatEntry = (
        <div key="beats">
          <h5 className="text-center text-capitalize">{t('Beats')}</h5>
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

  return PlotlineTemplateDetails
}

export default PlotlineTemplateDetailsConnector
