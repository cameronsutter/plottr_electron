import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import {
  ButtonToolbar,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
  Glyphicon,
} from 'react-bootstrap'
import { t } from 'plottr_locales'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedBookSelectList from '../project/BookSelectList'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedImage from '../images/Image'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedSelectList from '../SelectList'

import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const PlaceViewConnector = (connector) => {
  const BookSelectList = UnconnectedBookSelectList(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const Image = UnconnectedImage(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const RichText = UnconnectedRichText(connector)
  const SelectList = UnconnectedSelectList(connector)
  const CategoryPicker = UnconnectedCategoryPicker(connector)

  const {
    pltr: { helpers },
  } = connector
  checkDependencies({ helpers })

  const PlaceView = ({
    place,
    editing,
    startEditing,
    stopEditing,
    actions,
    customAttributes,
    cards,
    notes,
    selection,
    editorPath,
    darkMode,
    tags,
    places,
  }) => {
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
      return () => {
        if (editing) saveEdit(false)
      }
    }, [])

    const deletePlace = (e) => {
      e.stopPropagation()
      actions.deletePlace(place.id)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
      stopEditing()
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveEdit()
      }
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        saveEdit()
      }
    }

    const handleAttrDescriptionChange = (attrName, desc, selection) => {
      const editorPath = helpers.editors.placeCustomAttributeEditorPath(place.id, attrName)

      actions.editPlace(
        place.id,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    const handleNotesChanged = (value, selection) => {
      actions.editPlace(
        place.id,
        helpers.editors.attrIfPresent('notes', value),
        editorPath,
        selection
      )
    }

    const saveEdit = (close = true) => {
      if (close) stopEditing()
    }

    const changeName = (newName) => {
      actions.editPlace(place.id, { name: newName })
    }

    const changeCategory = (newCategoryId) => {
      actions.editPlace(place.id, { categoryId: newCategoryId })
    }

    const editDescription = (newDescription) => {
      actions.editPlace(place.id, { description: newDescription })
    }

    const updateImageId = (newImageId) => {
      actions.editPlace(place.id, { imageId: newImageId })
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={place.name || t('New Place')}
          onDelete={deletePlace}
          onCancel={cancelDelete}
        />
      )
    }

    const renderEditingImage = () => {
      return (
        <FormGroup>
          <ControlLabel>{t('Place Image')}</ControlLabel>
          <div className="place-list__place__edit-image-wrapper">
            <div className="place-list__place__edit-image">
              <Image size="small" shape="rounded" imageId={place.imageId} />
            </div>
            <div>
              <ImagePicker selectedId={place.imageId} chooseImage={updateImageId} deleteButton />
            </div>
          </div>
        </FormGroup>
      )
    }

    const renderEditingCustomAttributes = () => {
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.placeCustomAttributeEditorPath(place.id, attr.name)
        const { name, type } = attr
        return (
          <React.Fragment key={`custom-attribute-${index}-${name}`}>
            <EditAttribute
              index={index}
              entityType="place"
              value={place[name]}
              editorPath={editorPath}
              onChange={(desc, selection) => handleAttrDescriptionChange(name, desc, selection)}
              onSave={saveEdit}
              name={name}
              type={type}
            />
          </React.Fragment>
        )
      })
    }

    const renderEditing = () => {
      return (
        <div className="place-list__place-wrapper">
          <div className={cx('place-list__place', 'editing', { darkmode: darkMode })}>
            <div className="place-list__place__edit-form">
              <div className="place-list__inputs__normal">
                <FormGroup>
                  <ControlLabel>{t('Name')}</ControlLabel>
                  <FormControl
                    type="text"
                    onChange={withEventTargetValue(changeName)}
                    autoFocus
                    onKeyDown={handleEsc}
                    onKeyPress={handleEnter}
                    defaultValue={place.name}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{t('Short Description')}</ControlLabel>
                  <FormControl
                    type="text"
                    onChange={withEventTargetValue(editDescription)}
                    onKeyDown={handleEsc}
                    onKeyPress={handleEnter}
                    defaultValue={place.description}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{t('Category')}</ControlLabel>
                  <CategoryPicker
                    type="places"
                    selectedId={place.categoryId}
                    onChange={changeCategory}
                  />
                </FormGroup>
                {renderEditingImage()}
                <FormGroup>
                  <ControlLabel>{t('Notes')}</ControlLabel>
                  <RichText
                    id={editorPath}
                    description={place.notes}
                    onChange={handleNotesChanged}
                    selection={selection}
                    editable
                    autofocus={false}
                  />
                </FormGroup>
              </div>
              <div className="place-list__inputs__custom">{renderEditingCustomAttributes()}</div>
            </div>
            <ButtonToolbar className="card-dialog__button-bar">
              <Button bsStyle="success" onClick={saveEdit}>
                {t('Save')}
              </Button>
              <Button className="card-dialog__delete" onClick={handleDelete}>
                {t('Delete')}
              </Button>
            </ButtonToolbar>
          </div>
        </div>
      )
    }

    const renderPlace = () => {
      const details = customAttributes.map((attr, idx) => {
        const { name, type } = attr
        let desc = <dd>{place[name]}</dd>
        if (type == 'paragraph') {
          desc = (
            <dd>
              <RichText description={place[name]} />
            </dd>
          )
        }
        return (
          <dl key={idx} className="dl-horizontal">
            <dt>{name}</dt>
            {desc}
          </dl>
        )
      })
      return (
        <div className="place-list__place-wrapper">
          {renderDelete()}
          <div className="place-list__place" onClick={startEditing}>
            <h4 className="secondary-text">{place.name || t('New Place')}</h4>
            <div className="place-list__place-inner">
              <div>
                <dl className="dl-horizontal">
                  <dt>{t('Description')}</dt>
                  <dd>{place.description}</dd>
                </dl>
                {details}
                <dl className="dl-horizontal">
                  <dt>{t('Notes')}</dt>
                  <dd>
                    <RichText description={place.notes} />
                  </dd>
                </dl>
              </div>
              <div className="place-list__right-side">
                <Glyphicon glyph="pencil" />
                <Image responsive imageId={place.imageId} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (editing) window.SCROLLWITHKEYS = false
    else window.SCROLLWITHKEYS = true

    return (
      <div className={cx('place-list__place-view', { darkmode: darkMode })}>
        <div className="place-list__place-view__left-side">
          <BookSelectList
            selectedBooks={place.bookIds}
            parentId={place.id}
            add={actions.addBook}
            remove={actions.removeBook}
          />
          <SelectList
            parentId={place.id}
            type={'Tags'}
            selectedItems={place.tags}
            allItems={tags}
            add={actions.addTag}
            remove={actions.removeTag}
          />
        </div>
        <div className="place-list__place-view__right-side">
          {editing ? renderEditing() : renderPlace()}
        </div>
      </div>
    )
  }

  PlaceView.propTypes = {
    place: PropTypes.object.isRequired,
    editing: PropTypes.bool.isRequired,
    startEditing: PropTypes.func.isRequired,
    stopEditing: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    selection: PropTypes.object.isRequired,
    editorPath: PropTypes.string.isRequired,
    darkMode: PropTypes.bool,
    tags: PropTypes.array.isRequired,
    places: PropTypes.array,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  const { sortedTagsSelector } = selectors
  const PlaceActions = actions.place

  checkDependencies({ redux, selectors, actions, sortedTagsSelector, PlaceActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        const editorPath = helpers.editors.placeNotesEditorPath(ownProps.place.id)
        return {
          customAttributes: state.present.customAttributes.places,
          cards: state.present.cards,
          notes: state.present.notes,
          darkMode: selectors.isDarkModeSelector(state.present),
          editorPath,
          selection: selectors.selectionSelector(state.present, editorPath),
          tags: sortedTagsSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(PlaceActions, dispatch),
        }
      }
    )(PlaceView)
  }

  throw new Error('Could not connect PlaceView')
}

export default PlaceViewConnector
