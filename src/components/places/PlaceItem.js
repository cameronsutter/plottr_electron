import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Button, ButtonGroup } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'

import { checkDependencies } from '../checkDependencies'

const PlaceItemConnector = (connector) => {
  const Image = UnconnectedImage(connector)

  const PlaceItem = ({ place, selected, select, startEdit, stopEdit, actions }) => {
    const [deleting, setDeleting] = useState(false)

    const ref = useRef()

    const scrollIntoView = () => {
      if (selected) {
        const node = ref.current
        if (node) node.scrollIntoView()
      }
    }

    useEffect(() => {
      scrollIntoView()
    }, [place, selected, select])

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
      stopEdit()
    }

    const selectPlace = () => {
      if (selected) {
        startEdit()
      } else {
        select(place.id)
      }
    }

    const startEditing = (e) => {
      e.stopPropagation()
      select(place.id)
      startEdit()
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={place.name || i18n('New Place')}
          onDelete={deletePlace}
          onCancel={cancelDelete}
        />
      )
    }

    let img = null
    if (place.imageId) {
      img = (
        <div className="place-list__item-inner__image-wrapper">
          <Image size="small" shape="rounded" imageId={place.imageId} />
        </div>
      )
    }
    const klasses = cx('list-group-item', { selected: selected })
    const buttonKlasses = cx('place-list__item-buttons', { visible: selected })
    return (
      <div className={klasses} ref={ref} onClick={selectPlace}>
        {renderDelete()}
        <div className="place-list__item-inner">
          {img}
          <div>
            <h6 className={cx('list-group-item-heading', { withImage: !!place.imageId })}>
              {place.name || i18n('New Place')}
            </h6>
            <p className="list-group-item-text">{place.description.substr(0, 100)}</p>
          </div>
          <ButtonGroup className={buttonKlasses}>
            <Button bsSize="small" onClick={startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button bsSize="small" onClick={handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    )
  }

  PlaceItem.propTypes = {
    place: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    select: PropTypes.func.isRequired,
    startEdit: PropTypes.func.isRequired,
    stopEdit: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  const PlaceActions = actions.place
  checkDependencies({ redux, actions, PlaceActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(null, (dispatch) => {
      return {
        actions: bindActionCreators(PlaceActions, dispatch),
      }
    })(PlaceItem)
  }

  throw new Error('Could not connect PlaceItem')
}

export default PlaceItemConnector
