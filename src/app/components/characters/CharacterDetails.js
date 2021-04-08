import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { RichText, Image } from 'connected-components'
import { actions, selectors } from 'pltr/v2'

const CharacterActions = actions.character

const { singleCharacterSelector } = selectors

class CharacterDetails extends Component {
  render() {
    const { character, ui, customAttributes, categories } = this.props
    const customAttrNotes = customAttributes.map((attr, idx) => {
      const { name, type } = attr
      let desc
      if (type == 'paragraph') {
        desc = (
          <dd>
            <RichText description={character[name]} darkMode={ui.darkMode} />
          </dd>
        )
      } else {
        desc = <dd>{character[name]}</dd>
      }
      return (
        <dl key={idx} className="dl-horizontal">
          <dt>{name}</dt>
          {desc}
        </dl>
      )
    })
    const templateNotes = character.templates.flatMap((t) => {
      return t.attributes.map((attr) => {
        let val
        if (attr.type == 'paragraph') {
          val = (
            <dd>
              <RichText description={attr.value} darkMode={ui.darkMode} />
            </dd>
          )
        } else {
          val = <dd>{attr.value}</dd>
        }
        return (
          <dl key={attr.name} className="dl-horizontal">
            <dt>{attr.name}</dt>
            {val}
          </dl>
        )
      })
    })

    const category = categories.find((cat) => cat.id == character.categoryId)

    return (
      <div className="character-list__character-wrapper">
        <div className="character-list__character" onClick={this.props.startEditing}>
          <h4 className="secondary-text">{character.name || i18n('New Character')}</h4>
          <div className="character-list__character-notes">
            <div>
              <Image size="large" shape="circle" imageId={character.imageId} />
              <dl className="dl-horizontal">
                <dt>{i18n('Description')}</dt>
                <dd>{character.description}</dd>
              </dl>
              <dl className="dl-horizontal">
                <dt>{i18n('Category')}</dt>
                <dd>{(category && category.name) || i18n('Uncategorized')}</dd>
              </dl>
              {customAttrNotes}
              <dl className="dl-horizontal">
                <dt>{i18n('Notes')}</dt>
                <dd>
                  <RichText description={character.notes} darkMode={ui.darkMode} />
                </dd>
              </dl>
              {templateNotes}
            </div>
            <div className="character-list__right-side">
              <Glyphicon glyph="pencil" />
            </div>
          </div>
        </div>
      </div>
    )
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

function mapStateToProps(state, ownProps) {
  return {
    character: singleCharacterSelector(state.present, ownProps.characterId),
    categories: state.present.categories.characters,
    customAttributes: state.present.customAttributes.characters,
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterDetails)
