import React, { Component, PropTypes } from 'react'
import MarkDown from 'pagedown'

const md = MarkDown.getSanitizingConverter()

class MDdescription extends Component {
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
    let html = this.makeLabels(md.makeHtml(this.props.description))
    return <div
      className={this.props.className}
      onClick={this.props.onClick}
      dangerouslySetInnerHTML={{__html: html}} />
  }
}

MDdescription.propTypes = {
  description: PropTypes.string.isRequired,
  labels: PropTypes.object.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  darkMode: PropTypes.bool.isRequired,
}

export default MDdescription
