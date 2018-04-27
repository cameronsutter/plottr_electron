import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { shell } from 'electron'
import { Input, ButtonToolbar, Button } from 'react-bootstrap'
import _ from 'lodash'
import * as CardActions from 'actions/cards'
import MDdescription from 'components/mdDescription'
import TagLabel from 'components/tagLabel'
import i18n from 'format-message'

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
        label={i18n('title')} ref='titleInput'
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
          <Input type='textarea' label={i18n('description')} rows='15'
            ref='descriptionInput' defaultValue={description}
            onKeyDown={this.handleEsc}
            />
          <small>{i18n('Format with markdown!')} <a href='#' onClick={() => shell.openExternal(url)}>{i18n('learn how')}</a></small>
          <ButtonToolbar className='card-dialog__button-bar'>
            <Button
              onClick={() => this.setState({editing: false})} >
              {i18n('Cancel')}
            </Button>
            <Button bsStyle='success'
              onClick={this.saveEdit}>
              {i18n('Save')}
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
        darkMode={this.props.ui.darkMode}
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
    let line = this.line()
    let style = {color: line.color}
    const title = this.renderTitle()
    const description = this.renderDescription()
    let klasses = 'outline__card'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className={klasses}>
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
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui,
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
