import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FormControl, FormGroup, ControlLabel, ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as CardActions from 'actions/cards'
import TagLabel from 'components/tagLabel'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import cx from 'classnames'
import Image from 'components/images/Image'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false, description: props.card.description}
  }

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
  }

  saveEdit = () => {
    var newTitle = findDOMNode(this.refs.titleInput).value || this.props.card.title
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
        <FormControl
          onKeyPress={this.handleEnter}
          onKeyDown={this.handleEsc}
          type='text' autoFocus
          ref='titleInput'
          defaultValue={title} />
      </FormGroup>
    } else {
      return <h6>{title}</h6>
    }
  }

  renderDescription () {
    const { description } = this.props.card
    return (
      <div className='outline__description__editing'>
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
      var tag = this.props.tags.find(t => t.id == tId)
      return <TagLabel tag={tag} key={`outline-taglabel-${tId}`} />
    })
  }

  renderChipCloud (ids, list) {
    if (!ids.length) return null

    const chips = ids.map((id, idx) => {
      const thing = list.find(l => l.id == id)
      if (!thing) return null
      const key = `${idx}-${id}`
      return <div key={key} className='chip'>
        <Image size='xs' shape='circle' imageId={thing.imageId}/>
        <span>{ thing.name }</span>
      </div>
    })

    return <div className='chip-cloud'>{ chips }</div>
  }

  renderCharacters () {
    const { card, characters } = this.props
    return this.renderChipCloud(card.characters, characters)
  }

  renderPlaces () {
    const { card, places } = this.props
    return this.renderChipCloud(card.places, places)
  }

  renderDivider () {
    const { card } = this.props
    if (!card.tags.length && !card.characters.length && !card.places.length) return null

    return <div className='divider'/>
  }

  render () {
    const { line, ui } = this.props
    const style = {color: line.color}
    return (
      <div className={cx('outline__card', {darkmode: ui.darkMode})}>
        <div className={cx('outline__card__inner', {editing: this.state.editing})} onClick={this.editOnClick}>
          <div style={style} className='outline__card__line-title'>{line.title}</div>
          { this.renderTitle() }
          { this.renderDescription() }
          <Glyphicon glyph='pencil' />
        </div>
        { this.renderDivider() }
        <div className='outline__card__label-list'>
          { this.renderTags() }
        </div>
        { this.renderCharacters() }
        { this.renderPlaces() }
      </div>
    )
  }
}

CardView.propTypes = {
  card: PropTypes.object.isRequired,
  line: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  images: PropTypes.object,
}

function mapStateToProps (state, ownProps) {
  let line = null
  if (state.ui.currentTimeline == 'series') {
    // get the right seriesLines
    line = state.seriesLines.find(sl => sl.id === ownProps.card.seriesLineId)
  } else {
    // get the right lines for state.ui.currentTimeline (bookId)
    line = state.lines.find(l => l.id == ownProps.card.lineId)
  }
  return {
    line: line,
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
