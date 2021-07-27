import React, { PureComponent, createRef } from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedCardDialog from './CardDialog'
import { Popover } from 'react-bootstrap'
import OverlayTrigger from '../OverlayTrigger'
import UnconnectedRichText from '../rce/RichText'
import TagLabel from '../TagLabel'
import cx from 'classnames'
import { FaCircle } from 'react-icons/fa'
import { helpers } from 'pltr/v2'
import tinycolor from 'tinycolor2'

const {
  card: { truncateTitle },
  colors: { getContrastYIQ },
} = helpers

const CardConnector = (connector) => {
  const CardDialog = UnconnectedCardDialog(connector)
  const RichText = UnconnectedRichText(connector)

  class Card extends PureComponent {
    cardRef = createRef()

    constructor(props) {
      super(props)
      this.state = {
        dialogOpen: false,
        dragging: false,
        inDropZone: false,
        dropDepth: 0,
        hovering: false, // forces a rerender to determine where to place the overlay
      }

      this.renderPopover = this.renderPopover.bind(this)
    }

    closeDialog = () => {
      this.setState({ dialogOpen: false })
    }

    handleDragStart = (e) => {
      this.setState({ dragging: true })
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify({ cardId: this.props.card.id }))
    }

    handleDragEnd = () => {
      this.setState({ dragging: false })
    }

    startHovering = () => {
      this.setState({ hovering: true })
    }

    stopHovering = () => {
      this.setState({ hovering: false })
    }

    openDialog = () => {
      this.setState({ dialogOpen: true })
    }

    renderDialog() {
      if (!this.state.dialogOpen) return null
      const { ui, card, beatId, lineId } = this.props
      return (
        <CardDialog
          ui={ui}
          cardId={card.id}
          beatId={beatId}
          lineId={lineId}
          closeDialog={this.closeDialog}
        />
      )
    }

    renderPopover() {
      return (
        <Popover title={this.props.card.title} id={`card-popover-${this.props.card.id}`}>
          <div className="card__popover-wrapper">
            <RichText
              description={this.props.cardDescription}
              editable={false}
              className="card__popover-description"
              darkMode={this.props.ui.darkMode}
            />
            {this.renderTags()}
          </div>
        </Popover>
      )
    }

    // TODO: this should be a selector
    hasDetailsToShow() {
      const { card, cardDescription } = this.props

      if (card.tags && card.tags.length) return true

      if (!cardDescription) return false
      if (!cardDescription.length) return false
      if (cardDescription.length > 1) return true

      // if it only has one blank paragraph
      if (
        cardDescription.length == 1 &&
        cardDescription[0] &&
        cardDescription[0].children &&
        cardDescription[0].children.length == 1 &&
        cardDescription[0].children[0] &&
        cardDescription[0].children[0].text == ''
      )
        return false

      return true
    }

    renderTags() {
      const { card, tags } = this.props
      if (!card.tags || !card.tags.length) return null

      const tagLabels = card.tags.map((tId) => {
        const tag = tags.find((t) => t.id == tId)
        if (!tag) return null
        return <TagLabel tag={tag} key={`taglabel-${tId}`} />
      })

      return <div className="card__popover-labels">{tagLabels}</div>
    }

    renderDropZone() {
      const { color, allowDrop, isSmall } = this.props
      if (!allowDrop) return
      if (!this.state.inDropZone) return

      let circleStyle = {}
      if (isSmall) circleStyle = { color: color }

      return (
        <div className="card__drop-zone">
          <FaCircle style={circleStyle} />
        </div>
      )
    }

    renderTitle() {
      const { card, isSmall, ui, beatPosition, linePosition } = this.props
      let titleStyle = {}
      if (!isSmall && card.color) {
        titleStyle.backgroundColor = card.color
        const [useBlack, _] = getContrastYIQ((card.color && card.color) || '#F1F5F8') // $gray-9
        if (!useBlack) {
          titleStyle.color = 'white'
        }
      }
      let title = (
        <div className="card__title" style={titleStyle}>
          {isSmall ? '' : truncateTitle(card.title, 150)}
        </div>
      )

      if (!this.state.dragging && (isSmall || this.hasDetailsToShow())) {
        let placement = 'left'

        // sane default placements
        if (isSmall) {
          placement = 'right'
        } else {
          if (ui.orientation === 'horizontal' && Number(beatPosition) <= 2) {
            placement = 'right'
          } else if (Number(linePosition) <= 2) {
            placement = 'right'
          }
        }

        // use location of the card on the screen if possible
        const cardPos = this.cardRef.current ? this.cardRef.current.getBoundingClientRect() : null
        // #root is used by storybook, we cannot control where it renders the react app to.
        const rootElem =
          document.querySelector('#react-root') ||
          document.querySelector('#root') ||
          document.querySelector('#__next')
        if (rootElem) {
          const rootElemDimensions = rootElem.getBoundingClientRect()
          const midPoint = rootElemDimensions.width / 2
          if (cardPos) {
            if (cardPos.x > midPoint) placement = 'left'
            if (cardPos.x < midPoint) placement = 'right'
          }
        }

        title = (
          <OverlayTrigger trigger="hover" placement={placement} overlay={this.renderPopover}>
            {title}
          </OverlayTrigger>
        )
      }

      return title
    }

    render() {
      const { color, card, isVisible, allowDrop, last, isSmall, isMedium, ui } = this.props
      var cardStyle = {
        borderColor: card.color ? tinycolor(card.color).darken(10).toHslString() : color,
      }
      let cardCircleStyle = { backgroundColor: color }

      if (this.state.dragging) {
        cardStyle.opacity = '0.5'
        cardCircleStyle.opacity = '0.5'
      }
      if (!isVisible) {
        cardStyle.opacity = '0.1'
        cardCircleStyle.opacity = '0.1'
      }

      if (isSmall) {
        return (
          <div
            ref={this.cardRef}
            onDragEnter={this.props.handleDragEnter}
            onDragOver={this.props.handleDragOver}
            onDragLeave={this.props.handleDragLeave}
            onDrop={this.props.handleDrop}
          >
            {this.props.dropZone}
            {this.renderDialog()}
            <div
              className="card-circle"
              style={cardCircleStyle}
              draggable
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
              onMouseOver={this.startHovering}
              onMouseLeave={this.stopHovering}
            >
              <div onClick={this.openDialog}>{this.renderTitle()}</div>
            </div>
          </div>
        )
      } else {
        const bodyKlass = cx('card__body', {
          'medium-timeline': isMedium,
          vertical: ui.orientation == 'vertical',
        })
        return (
          <div
            ref={this.cardRef}
            className={cx('card__body-wrapper', { lastOne: last })}
            onDragEnter={this.props.handleDragEnter}
            onDragOver={this.props.handleDragOver}
            onDragLeave={this.props.handleDragLeave}
            onDrop={this.props.handleDrop}
          >
            {this.renderDialog()}
            {this.props.dropZone}
            <div
              className={bodyKlass}
              style={cardStyle}
              draggable
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
              onClick={this.openDialog}
              onMouseOver={this.startHovering}
              onMouseLeave={this.stopHovering}
            >
              {this.renderTitle()}
            </div>
          </div>
        )
      }
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //   // console.log('title updated', this.props.card)
    //   // console.log('title updated next', nextProps.card)
    //   if (this.state.dragging != nextState.dragging) return true
    //   if (this.state.dialogOpen != nextState.dialogOpen) return true
    //   if (this.state.inDropZone != nextState.inDropZone) return true
    //   if (this.state.hovering != nextState.hovering) return true
    //   if (this.props.color != nextProps.color) return true
    //   if (this.props.isVisible != nextProps.isVisible) return true
    //   if (this.props.card != nextProps.card) return true
    //   if (this.props.last != nextProps.last) return true
    //   if (this.props.ui.timeline.size != nextProps.ui.timeline.size) return true

    //   return false
    // }
  }

  Card.propTypes = {
    card: PropTypes.object.isRequired,
    cardDescription: PropTypes.array.isRequired,
    beatId: PropTypes.number.isRequired,
    lineId: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    last: PropTypes.bool.isRequired,
    linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    beatPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    moveCard: PropTypes.func.isRequired,
    idx: PropTypes.number.isRequired,
    allowDrop: PropTypes.bool.isRequired,
    tags: PropTypes.array,
    ui: PropTypes.object.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isSmall: PropTypes.bool.isRequired,
    isMedium: PropTypes.bool.isRequired,
    handleDragEnter: PropTypes.func,
    handleDragOver: PropTypes.func,
    handleDragLeave: PropTypes.func,
    handleDrop: PropTypes.func,
    dropZone: PropTypes.func,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  const { cardDescriptionByIdSelector, visibleCardsSelector, isSmallSelector, isMediumSelector } =
    selectors
  const CardActions = actions.card

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          cardDescription: cardDescriptionByIdSelector(state.present, ownProps.card.id),
          tags: state.present.tags,
          ui: state.present.ui,
          isVisible: visibleCardsSelector(state.present)[ownProps.card.id],
          isSmall: isSmallSelector(state.present),
          isMedium: isMediumSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
        }
      }
    )(Card)
  }

  throw new Error('Could not connect Card')
}

export default CardConnector
