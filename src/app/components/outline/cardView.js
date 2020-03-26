import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { shell } from 'electron'
import { FormControl, FormGroup, ControlLabel, ButtonToolbar, Button } from 'react-bootstrap'
import _ from 'lodash'
import * as CardActions from 'actions/cards'
import MDdescription from 'components/mdDescription'
import TagLabel from 'components/tagLabel'
import i18n from 'format-message'
import RichText from '../rce/RichText'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false, description: props.card.description}
  }

  line () {
    return _.find(this.props.lines, {id: this.props.card.lineId})
  }

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
  }

  saveEdit = () => {
    var newTitle = ReactDOM.findDOMNode(this.refs.titleInput).value || this.props.card.title
    this.props.actions.editCard(this.props.card.id, newTitle, this.state.description)
    this.setState({editing: false})
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

  editOnClick = () => {
    if (!this.state.editing) this.setState({editing: true})
  }

  renderTitle () {
    const { title } = this.props.card

    if (this.state.editing) {
      return <FormGroup>
        <ControlLabel>{i18n('title')}</ControlLabel>
        <FormControl
          onKeyPress={this.handleEnter}
          onKeyDown={this.handleEsc}
          type='text' autoFocus
          ref='titleInput'
          defaultValue={title} />
      </FormGroup>
    } else {
      return <h6 onClick={() => this.setState({editing: true})}>{title}</h6>
    }
  }

  renderDescription () {
    const { description } = this.props.card
    return (
      <div className='outline__description__editing' onClick={this.editOnClick}>
        <RichText
          className='outline__description'
          onChange={(desc) => this.setState({description: desc})}
          description={description}
          editable={this.state.editing}
          darkMode={this.props.ui.darkMode}
        />
        {this.state.editing && <ButtonToolbar className='card-dialog__button-bar'>
          <Button
            onClick={() => this.setState({editing: false})} >
            {i18n('Cancel')}
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit}>
            {i18n('Save')}
          </Button>
        </ButtonToolbar>}
      </div>
    )
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
