import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FiCopy } from 'react-icons/fi'

import { t as i18n } from 'plottr_locales'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'
import UnconnectedPlottrFloater from '../PlottrFloater'

import { checkDependencies } from '../checkDependencies'

const CharacterItemConnector = (connector) => {
  const Image = UnconnectedImage(connector)
  const Floater = UnconnectedPlottrFloater(connector)

  class CharacterItem extends Component {
    state = { deleting: false }

    constructor(props) {
      super(props)
      this.ref = React.createRef()
    }

    componentDidMount() {
      this.scrollIntoView()
    }

    componentDidUpdate() {
      this.scrollIntoView()
    }

    scrollIntoView = () => {
      if (this.props.selected) {
        const node = this.ref.current
        if (node) node.scrollIntoView()
      }
    }

    deleteCharacter = (e) => {
      e.stopPropagation()
      this.props.actions.deleteCharacter(this.props.character.id)
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

    selectCharacter = () => {
      const { character, selected, select, startEdit } = this.props
      if (selected) {
        startEdit()
      } else {
        select(character.id)
      }
    }

    startEditing = (e) => {
      e.stopPropagation()
      this.props.select(this.props.character.id)
      this.props.startEdit()
    }

    handleDuplicate = () => {
      this.props.actions.duplicateCharacter(this.props.character.id)
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.character.name || i18n('New Character')}
          onDelete={this.deleteCharacter}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderHoverOptions = () => {
      return (
        <ButtonGroup className="btn-group__list-group-item">
          <Button bsSize="small" onClick={this.startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button bsSize="small" onClick={this.handleDuplicate}>
            <FiCopy />
          </Button>
          <Button bsSize="small" onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
        </ButtonGroup>
      )
    }

    render() {
      const { character, selected } = this.props
      let img = null
      if (character.imageId) {
        img = (
          <div className="character-list__item-inner__image-wrapper">
            <Image shape="circle" size="small" imageId={character.imageId} />
          </div>
        )
      }
      const klasses = cx('list-group-item', { selected: selected })
      return (
        <Floater
          hideArrow
          open={selected}
          placement="bottom"
          component={this.renderHoverOptions}
          zIndex={1}
        >
          <div className={klasses} ref={this.ref} onClick={this.selectCharacter}>
            <div className="character-list__item-inner">
              {img}
              <div>
                <h6 className={cx('list-group-item-heading', { withImage: !!character.imageId })}>
                  {character.name || i18n('New Character')}
                </h6>
                <p className="list-group-item-text">{character.description.substr(0, 100)}</p>
              </div>

              {this.renderDelete()}
            </div>
          </div>
        </Floater>
      )
    }

    static propTypes = {
      character: PropTypes.object.isRequired,
      selected: PropTypes.bool.isRequired,
      select: PropTypes.func.isRequired,
      startEdit: PropTypes.func.isRequired,
      stopEdit: PropTypes.func.isRequired,
      actions: PropTypes.object.isRequired,
    }
  }

  const {
    redux,
    pltr: { actions },
  } = connector

  checkDependencies({ redux, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(null, (dispatch) => {
      return {
        actions: bindActionCreators(actions.character, dispatch),
      }
    })(CharacterItem)
  }

  throw new Error('Cannot connect CharacterItem')
}

export default CharacterItemConnector
