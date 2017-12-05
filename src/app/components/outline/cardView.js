import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { shell } from 'electron'
import { Input, ButtonToolbar, Button } from 'react-bootstrap'
import _ from 'lodash'
import * as CardActions from 'actions/cards'
import MDdescription from 'components/mdDescription'
import TagLabel from 'components/tagLabel'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  line () {
    return _.find(this.props.lines, {id: this.props.card.lineId})
  }

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
  }

  saveEdit = () => {
    var newTitle = this.refs.titleInput.getValue() || this.props.card.title
    var newDescription = this.refs.descriptionInput.getValue() || this.props.card.description
    this.saveCreatedLabels(newDescription)
    this.props.actions.editCard(this.props.card.id, newTitle, newDescription)
    this.setState({editing: false})
  }

  saveCreatedLabels (desc) {
    var regex = /{{([\w\s]*)}}/gi
    var matches
    while ((matches = regex.exec(desc)) !== null) {
      var labelText = matches[1].toLowerCase()
      if (this.props.labelMap[labelText] !== undefined) {
        const { id, type } = this.props.labelMap[labelText]
        if (!this.alreadyHasLabel(id, type)) {
          this.props.actions[`add${type}`](this.props.card.id, id)
        }
      }
    }
  }

  alreadyHasLabel (id, type) {
    let attr = `${type.toLowerCase()}s`
    return this.props.card[attr].includes(id)
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  handleEsc = (event) => {
    if (event.which === 27) {
      this.saveEdit()
    }
  }

  renderTitle () {
    const { title } = this.props.card

    if (this.state.editing) {
      return <Input
        onKeyPress={this.handleEnter}
        onKeyDown={this.handleEsc}
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
            onKeyDown={this.handleEsc}
            />
          <small>Format with markdown! <a href='#' onClick={() => shell.openExternal(url)}>learn how</a></small>
          <ButtonToolbar className='card-dialog__button-bar'>
            <Button
              onClick={() => this.setState({editing: false})} >
              Cancel
            </Button>
            <Button bsStyle='success'
              onClick={this.saveEdit}>
              Save
            </Button>
          </ButtonToolbar>
        </div>
      )
    } else {
      return <MDdescription
        className='outline__description'
        onClick={() => this.setState({editing: true})}
        description={description}
        labels={this.props.labelMap}
      />
    }
  }

  renderTags () {
    return this.props.card.tags.map(tId => {
      var tag = _.find(this.props.tags, {id: tId})
      return <TagLabel tag={tag} key={`outline-taglabel-${tId}`} />
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
