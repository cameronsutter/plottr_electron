import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup } from 'react-bootstrap'
import i18n from 'format-message'
import Image from '../images/Image'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import prettydate from 'pretty-date'
import { actions } from 'pltr/v2'

const NoteActions = actions.note

class PlaceItem extends Component {
  state = { deleting: false }

  componentDidMount() {
    this.scrollIntoView()
  }

  componentDidUpdate() {
    this.scrollIntoView()
  }

  scrollIntoView = () => {
    if (this.props.selected) {
      const node = findDOMNode(this)
      if (node) node.scrollIntoViewIfNeeded()
    }
  }

  deleteNote = (e) => {
    e.stopPropagation()
    this.props.actions.deleteNote(this.props.note.id)
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

  selectNote = () => {
    const { note, selected, select, startEdit } = this.props
    if (selected) {
      startEdit()
    } else {
      select(note.id)
    }
  }

  startEditing = (e) => {
    e.stopPropagation()
    this.props.select(this.props.note.id)
    this.props.startEdit()
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.note.title || i18n('New Note')}
        onDelete={this.deleteNote}
        onCancel={this.cancelDelete}
      />
    )
  }

  render() {
    const { note, selected } = this.props
    let img = null
    if (note.imageId) {
      img = (
        <div className="note-list__item-inner__image-wrapper">
          <Image responsive imageId={note.imageId} />
        </div>
      )
    }
    let lastEdited = null
    if (note.lastEdited) {
      lastEdited = (
        <p className="list-group-item-text secondary-text">
          {prettydate.format(new Date(note.lastEdited))}
        </p>
      )
    }
    const klasses = cx('list-group-item', { selected: selected })
    const buttonKlasses = cx('note-list__item-buttons', { visible: selected })
    return (
      <div className={klasses} onClick={this.selectNote}>
        {this.renderDelete()}
        <div className="note-list__item-inner">
          {img}
          <div>
            <h6 className={cx('list-group-item-heading', { withImage: !!note.imageId })}>
              {note.title || i18n('New Note')}
            </h6>
            {lastEdited}
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
    note: PropTypes.object.isRequired,
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
    actions: bindActionCreators(NoteActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceItem)
