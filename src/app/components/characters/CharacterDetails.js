import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import Image from '../images/Image'
import { singleCharacterSelector } from '../../selectors/characters'

class CharacterDetails extends Component {

  deleteCharacter = () => {
    // let text = i18n('Do you want to delete this character: { character }?', {character: this.props.character.name})
    // if (window.confirm(text)) {
    // }
    this.props.actions.deleteCharacter(this.props.character.id)
  }

  render () {
    const { character, ui, customAttributes, categories } = this.props
    const customAttrNotes = customAttributes.map((attr, idx) => {
      const { name, type } = attr
      let desc
      if (type == 'paragraph') {
        desc = <dd>
          <RichText description={character[name]} darkMode={ui.darkMode} />
        </dd>
      } else {
        desc = <dd>{character[name]}</dd>
      }
      return <dl key={idx} className='dl-horizontal'>
        <dt>{name}</dt>
        {desc}
      </dl>
    })
    const templateNotes = character.templates.flatMap(t => {
      return t.attributes.map(attr => {
        let val
        if (attr.type == 'paragraph') {
          val = <dd>
            <RichText description={attr.value} darkMode={ui.darkMode} />
          </dd>
        } else {
          val = <dd>{attr.value}</dd>
        }
        return <dl key={attr.name} className='dl-horizontal'>
          <dt>{attr.name}</dt>
          {val}
        </dl>
      })
    })

    const klasses = cx('character-list__character', { darkmode: ui.darkMode })

    const category = categories.find(cat => cat.id == character.categoryId)

    return <div className='character-list__character-wrapper'>
      <div className={klasses} onClick={this.props.startEditing}>
        <h4 className='secondary-text'>{character.name || i18n('New Character')}</h4>
        <div className='character-list__character-notes'>
          <div>
            <Image size='large' shape='circle' imageId={character.imageId} />
            <dl className='dl-horizontal'>
              <dt>{i18n('Description')}</dt>
              <dd>{character.description}</dd>
            </dl>
            <dl className='dl-horizontal'>
              <dt>{i18n('Category')}</dt>
              <dd>{category && category.name || i18n('Uncategorized')}</dd>
            </dl>
            {customAttrNotes}
            <dl className='dl-horizontal'>
              <dt>{i18n('Notes')}</dt>
              <dd>
                <RichText description={character.notes} darkMode={ui.darkMode} />
              </dd>
            </dl>
            {templateNotes}
          </div>
          <div className='character-list__right-side'>
            <Glyphicon glyph='pencil' />
          </div>
        </div>
      </div>
      <ButtonToolbar className='card-dialog__button-bar'>
        <Button className='card-dialog__delete' onClick={this.deleteCharacter}>
          {i18n('Delete')}
        </Button>
      </ButtonToolbar>
    </div>
  }

  static propTypes = {
    characterId: PropTypes.number.isRequired,
    character: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    startEditing: PropTypes.func.isRequired,
  }
}

function mapStateToProps (state, ownProps) {
  return {
    character: singleCharacterSelector(state, ownProps.characterId),
    categories: state.categories.characters,
    customAttributes: state.customAttributes.characters,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterDetails)