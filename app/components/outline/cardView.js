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

  renderLabels () {
    var characters = this.renderCharacters()
    var places = this.renderPlaces()
    var tags = this.renderTags()
    return (
      <div className='outline__card__label-list'>
        {characters}
        {places}
        {tags}
      </div>
    )
  }

  renderTags () {
    if (!this.props.card.tags) {
      return null
    }
    return this.props.card.tags.map(tId => {
      var tag = _.find(this.props.tags, 'id', tId)
      var style = {}
      if (tag.color) style = {backgroundColor: tag.color}
      return <Label bsStyle='info' style={style} key={tId}>{tag.title}</Label>
    })
  }

  renderPlaces () {
    if (!this.props.card.places) {
      return null
    }
    return this.props.card.places.map(pId =>
      <Label bsStyle='info' key={pId}>{_.result(_.find(this.props.places, 'id', pId), 'name')}</Label>
    )
  }

  renderCharacters () {
    if (!this.props.card.characters) {
      return null
    }
    return this.props.card.characters.map(cId =>
      <Label bsStyle='info' key={cId}>{_.result(_.find(this.props.characters, 'id', cId), 'name')}</Label>
    )
  }

  render () {
    const { title, description } = this.props.card
    var line = this.line()
    return (
      <div className='outline__card'>
        <div className='outline__card__line-title'>{line.title}</div>
        {this.renderLabels()}
        <h6>{title}</h6>
        <div
          dangerouslySetInnerHTML={{__html: md.makeHtml(description)}} >
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
  places: PropTypes.array.isRequired
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
