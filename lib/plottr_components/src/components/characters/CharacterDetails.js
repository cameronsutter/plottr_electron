import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon } from 'react-bootstrap'
import { t } from 'plottr_locales'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedImage from '../images/Image'

const CharacterDetailsConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)
  const Image = UnconnectedImage(connector)

  const {
    platform: {
      template: { getTemplateById },
    },
  } = connector

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
      const templateNotes = character.templates.map((t) => {
        const templateData = getTemplateById(t.id)
        const attrs = t.attributes.map((attr) => {
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
        return (
          <React.Fragment key={t.id}>
            <p>{templateData.name}</p>
            {attrs}
          </React.Fragment>
        )
      })

      const category = categories.find((cat) => cat.id == character.categoryId)

      return (
        <div className="character-list__character-wrapper">
          <div className="character-list__character" onClick={this.props.startEditing}>
            <h4 className="secondary-text">{character.name || t('New Character')}</h4>
            <div className="character-list__character-notes">
              <div>
                <Image size="large" shape="circle" imageId={character.imageId} />
                <dl className="dl-horizontal">
                  <dt>{t('Description')}</dt>
                  <dd>{character.description}</dd>
                </dl>
                <dl className="dl-horizontal">
                  <dt>{t('Category')}</dt>
                  <dd>{(category && category.name) || t('Uncategorized')}</dd>
                </dl>
                <p>{t('Attributes')}</p>
                <dl className="dl-horizontal">
                  <dt>{t('Notes')}</dt>
                  <dd>
                    <RichText description={character.notes} darkMode={ui.darkMode} />
                  </dd>
                </dl>
                {customAttrNotes}
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

  const {
    redux,
    pltr: {
      selectors: { singleCharacterSelector },
    },
  } = connector
  const characterActions = connector.pltr.actions.character

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          character: singleCharacterSelector(state.present, ownProps.characterId),
          categories: state.present.categories.characters,
          customAttributes: state.present.customAttributes.characters,
          ui: state.present.ui,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(characterActions, dispatch),
        }
      }
    )(CharacterDetails)
  }

  throw new Error('Cannot connect CharacterDetails')
}

export default CharacterDetailsConnector
