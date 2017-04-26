import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { shell } from 'electron'
import MarkDown from 'pagedown'
import { Label, Input, ButtonToolbar, Button } from 'react-bootstrap'
import _ from 'lodash'
import * as CardActions from 'actions/cards'

const md = MarkDown.getSanitizingConverter()

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  line () {
    return _.find(this.props.lines, {id: this.props.card.lineId})
  }

  saveEdit () {
    var newTitle = this.refs.titleInput.getValue() || this.props.card.title
    var newDescription = this.refs.descriptionInput.getValue() || this.props.card.description
    this.props.actions.editCard(this.props.card.id, newTitle, newDescription)
    this.setState({editing: false})
  }

  handleEnter (event) {
    if (event.which === 13) {
      this.saveEdit()
    }
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

  renderTitle () {
    const { title } = this.props.card

    if (this.state.editing) {
      return <Input
        onKeyPress={this.handleEnter.bind(this)}
        onKeyDown={(e) => {if (e.which === 27) this.setState({editing: false})}}
        type='text' autoFocus
        label='title' ref='titleInput'
        defaultValue={title} />
    } else {
      return <h6 onClick={() => this.setState({editing: true})}>{title}</h6>
    }
  }

  renderDescription () {
    const { description } = this.props.card
    if (this.state.editing) {
      const url = 'https://daringfireball.net/projects/markdown/syntax'
      return (
        <div className='outline__description__editing'>
          <Input type='textarea' label='description' rows='15'
            ref='descriptionInput' defaultValue={description}
            onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
            />
          <small>Format with markdown! <a href='#' onClick={() => shell.openExternal(url)}>learn how</a></small>
          <ButtonToolbar className='card-dialog__button-bar'>
            <Button
              onClick={() => this.setState({editing: false})} >
              Cancel
            </Button>
            <Button bsStyle='success'
              onClick={this.saveEdit.bind(this)}>
              Save
            </Button>
          </ButtonToolbar>
        </div>
      )
    } else {
      return <div className='outline__description' onClick={() => this.setState({editing: true})}
        dangerouslySetInnerHTML={{__html: this.makeLabels(md.makeHtml(description))}} >
      </div>
    }
  }

  renderTags () {
    return this.props.card.tags.map(tId => {
      var tag = _.find(this.props.tags, {id: tId})
      var style = {}
      if (tag.color) style = {backgroundColor: tag.color}
      return <Label bsStyle='info' style={style} key={tId}>{tag.title}</Label>
    })
  }

  render () {
    var line = this.line()
    var style = {color: line.color}
    const title = this.renderTitle()
    const description = this.renderDescription()
    return (
      <div className='outline__card'>
        <div style={style} className='outline__card__line-title'>{line.title}</div>
        {title}
        {description}
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
  labelMap: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
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
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView)
