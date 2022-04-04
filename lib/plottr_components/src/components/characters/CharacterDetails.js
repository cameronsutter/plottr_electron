import React from 'react'
import PropTypes from 'react-proptypes'
import Glyphicon from 'reeact-bootstrap/Glyphicon'
import { t } from 'plottr_locales'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedImage from '../images/Image'

import { checkDependencies } from '../checkDependencies'

const CharacterDetailsConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)
  const Image = UnconnectedImage(connector)

  const CharacterDetails = ({
    getTemplateById,
    templateAttributeValue,
    startEditing,
    character,
    customAttributes,
    categories,
  }) => {
    const customAttrNotes = customAttributes.map((attr, idx) => {
      const { name, type } = attr
      let desc
      if (type == 'paragraph') {
        desc = (
          <dd>
            <RichText
              id={`character.${character.id}.attribute.${name}`}
              description={character[name]}
            />
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
    const templateNotes = character.templates.map((thisTemplate) => {
      const templateData = getTemplateById(thisTemplate.id)
      const attrs = thisTemplate.attributes.map((attr) => {
        const attributeValue = templateAttributeValue(thisTemplate.id, attr.name)
        let val
        if (attr.type == 'paragraph') {
          val = (
            <dd>
              <RichText description={attributeValue} />
            </dd>
          )
        } else {
          val = <dd>{attributeValue}</dd>
        }
        return (
          <dl key={attr.name} className="dl-horizontal">
            <dt>{attr.name}</dt>
            {val}
          </dl>
        )
      })
      return (
        <React.Fragment key={thisTemplate.id}>
          <p>{templateData?.name || thisTemplate.name || t('Template')}</p>
          {attrs}
        </React.Fragment>
      )
    })

    const category = categories.find((cat) => cat.id == character.categoryId)

    return (
      <div className="character-list__character-wrapper">
        <div className="character-list__character" onClick={startEditing}>
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
              <dl className="dl-horizontal">
                <dt>{t('Notes')}</dt>
                <dd>
                  <RichText description={character.notes} />
                </dd>
              </dl>
              {customAttributes.length ? <p>{t('Attributes')}</p> : null}
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

  CharacterDetails.propTypes = {
    characterId: PropTypes.number.isRequired,
    character: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    startEditing: PropTypes.func.isRequired,
    getTemplateById: PropTypes.func.isRequired,
    templateAttributeValue: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  const characterActions = connector.pltr.actions.character

  checkDependencies({
    redux,
    characterActions,
    selectors,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          character: selectors.singleCharacterSelector(state.present, ownProps.characterId),
          categories: state.present.categories.characters,
          customAttributes: state.present.customAttributes.characters,
          getTemplateById: (templateId) =>
            selectors.templateByIdSelector(state.present, templateId),
          templateAttributeValue: (templateId, attributeName) => {
            return selectors.characterTemplateAttributeValueSelector(
              ownProps.characterId,
              templateId,
              attributeName
            )(state.present)
          },
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
