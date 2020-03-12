import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import MarkDown from 'pagedown'
import SimpleMDE from 'simplemde'
import RCE from './rce/RCE'
import SETTINGS from '../../settings'

const md = MarkDown.getSanitizingConverter()

class MDdescription extends Component {
  constructor (props) {
    super(props)
    this.simplemde = null
  }

  useSimpleMDE = SETTINGS.get('user.useMarkdown')

  createRCE = () => {
    if (this.useSimpleMDE) {
      this.simplemde = new SimpleMDE({
        element: this.refs.descriptionInput,
        initialValue: this.props.description,
        autofocus: this.props.autofocus || false,
        status: ['words'],
        hideIcons: ['side-by-side', 'fullscreen'],
        promptURLs: false,
      })
      this.simplemde.codemirror.on("update", () => {
        this.props.onChange(this.simplemde.value())
      })
    }
  }

  componentDidMount () {
    if (this.props.useRCE && this.useSimpleMDE) this.createRCE()
  }

  componentWillReceiveProps (nextProps) {
    if (this.useSimpleMDE && this.props.useRCE && !nextProps.useRCE) {
      this.simplemde.toTextArea()
      this.simplemde = null
    }
  }

  componentDidUpdate (prevProps) {
    if (this.useSimpleMDE && prevProps.useRCE != this.props.useRCE) {
      if (this.props.useRCE && !this.simplemde) {
        this.createRCE()
      }
    }
  }

  componentWillUnmount () {
    this.simplemde = null
  }

  makeLabels (html) {
    var regex = /{{([\w\s]*)}}/gi
    var matches
    while ((matches = regex.exec(html)) !== null) {
      var labelText = matches[1].toLowerCase()
      if (this.props.labels[labelText] !== undefined) {
        let style = 'color:#16222d;border:1px solid #16222d;padding-top:0.4em;'
        if (this.props.darkMode) style = 'color:#eee;border:1px solid #ddd;padding-top:0.4em;background-color:#777;'
        html = html.replace(matches[0], `<span style='${style}' class='label'>${labelText}</span>`)
      }
    }
    return html
  }

  render () {
    // darkmode?
    if (this.props.useRCE) {
      if (this.useSimpleMDE) {
        return <textarea rows='20' ref='descriptionInput' />
      }
      return <RCE text={this.props.description}/>
    } else {
      let html = this.makeLabels(md.makeHtml(this.props.description))
      return <div
        className={this.props.className}
        onClick={this.props.onClick}
        dangerouslySetInnerHTML={{__html: html}} />
    }
  }
}

MDdescription.propTypes = {
  description: PropTypes.string,
  labels: PropTypes.object.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func,
  useRCE: PropTypes.bool,
  autofocus: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
}

export default MDdescription
