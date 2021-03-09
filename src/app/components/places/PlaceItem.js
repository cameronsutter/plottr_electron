import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import Image from '../images/Image'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { actions } from 'pltr/v2'

const PlaceActions = actions.place

class PlaceItem extends Component {
  state = { deleting: false }

  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount() {
    this.scrollIntoView()

    // if (this.props.selected && !this.props.editing) document.addEventListener('keydown', this.deleteWithKeyboard)
  }

  componentDidUpdate() {
    this.scrollIntoView()

    // if (this.props.selected && !this.props.editing) document.addEventListener('keydown', this.deleteWithKeyboard)
    // else document.removeEventListener('keydown', this.deleteWithKeyboard)
  }

  scrollIntoView = () => {
    if (this.props.selected) {
      const node = this.ref.current
      if (node) node.scrollIntoView()
    }
  }

  // deleteWithKeyboard = e => {
  //   if (e.keyCode == 8 || e.keyCode == 46) {
  //     this.setState({deleting: true})
  //   }
  // }

  deletePlace = (e) => {
    e.stopPropagation()
    this.props.actions.deletePlace(this.props.place.id)
  }

  cancelDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false })
  }

  handleDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: true })
    this.props.stopEdit()
  }

  selectPlace = () => {
    const { place, selected, select, startEdit } = this.props
    if (selected) {
      startEdit()
    } else {
      select(place.id)
    }
  }

  startEditing = (e) => {
    e.stopPropagation()
    this.props.select(this.props.place.id)
    this.props.startEdit()
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.place.name || i18n('New Place')}
        onDelete={this.deletePlace}
        onCancel={this.cancelDelete}
      />
    )
  }

  render() {
    const { place, selected } = this.props
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
      <div className={klasses} ref={this.ref} onClick={this.selectPlace}>
        {this.renderDelete()}
        <div className="place-list__item-inner">
          {img}
          <div>
            <h6 className={cx('list-group-item-heading', { withImage: !!place.imageId })}>
              {place.name || i18n('New Place')}
            </h6>
            <p className="list-group-item-text">{place.description.substr(0, 100)}</p>
          </div>
          <ButtonGroup className={buttonKlasses}>
            <Button bsSize="small" onClick={this.startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button bsSize="small" onClick={this.handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    )
  }

  static propTypes = {
    place: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    select: PropTypes.func.isRequired,
    startEdit: PropTypes.func.isRequired,
    stopEdit: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceItem)
