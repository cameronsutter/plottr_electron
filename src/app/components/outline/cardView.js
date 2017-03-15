import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import MarkDown from 'pagedown'
import { Label } from 'react-bootstrap'
import _ from 'lodash'

const md = MarkDown.getSanitizingConverter()

class CardView extends Component {
  line () {
    return _.find(this.props.lines, 'id', this.props.card.lineId)
  }

  makeLabels (html) {
    var regex = /{{([\w\s]*)}}/gi
    var matches
    while ((matches = regex.exec(html)) !== null) {
      var labelText = matches[1].toLowerCase()
      if (this.props.labelMap[labelText] !== undefined) {
        var color = this.props.labelMap[labelText]
        html = html.replace(matches[0], `<span style='background-color:${color}' class='label label-info'>${labelText}</span>`)
      }
    }
    return html
  }

  renderTags () {
    return this.props.card.tags.map(tId => {
      var tag = _.find(this.props.tags, 'id', tId)
      var style = {}
      if (tag.color) style = {backgroundColor: tag.color}
      return <Label bsStyle='info' style={style} key={tId}>{tag.title}</Label>
    })
  }

  render () {
    const { title, description } = this.props.card
    var line = this.line()
    var style = {color: line.color}
    return (
      <div className='outline__card'>
        <div style={style} className='outline__card__line-title'>{line.title}</div>
        <h6>{title}</h6>
        <div
          dangerouslySetInnerHTML={{__html: this.makeLabels(md.makeHtml(description))}} >
        </div>
        <div className='outline__card__label-list'>
          {this.renderTags()}
        </div>
      </div>
    )
  }
}

CardView.propTypes = {
  card: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  labelMap: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    tags: state.tags,
    characters: state.characters,
    places: state.places
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView)
