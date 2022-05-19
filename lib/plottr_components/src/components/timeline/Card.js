import React, { Component, createRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FaCircle } from 'react-icons/fa'
import tinycolor from 'tinycolor2'
import Floater from 'react-floater'

import { helpers } from 'pltr/v2'

import Popover from '../PlottrPopover'
import UnconnectedCardDialog from './CardDialog'
import UnconnectedRichText from '../rce/RichText'
import TagLabel from '../TagLabel'
import { checkDependencies } from '../checkDependencies'

const {
  card: { truncateTitle },
  colors: { getContrastYIQ },
} = helpers

const CardConnector = (connector) => {
  const CardDialog = UnconnectedCardDialog(connector)
  const RichText = UnconnectedRichText(connector)

  class Card extends Component {
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

    componentDidMount() {
      // We attach the listener to the concrete HTML component because
      // the React API doesn't attach the listener at all when the
      // component that we want to drop onto is inside of a
      // floater/popover.
      if (this.cardRef.current) {
        this.cardRef.current.ondrop = this.handleDrop
      }
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

    handleDragEnter = (e) => {
      // https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
      if (!this.state.dragging) this.setState({ dropDepth: this.state.dropDepth + 1 })
    }

    handleDragOver = (e) => {
      e.preventDefault()
      if (!this.state.dragging) this.setState({ inDropZone: true })
    }

    handleDragLeave = (e) => {
      if (!this.state.dragging) {
        let dropDepth = this.state.dropDepth
        --dropDepth
        this.setState({ dropDepth: dropDepth })
        if (dropDepth > 0) return
        this.setState({ inDropZone: false })
      }
    }

    handleDrop = (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (this.state.dragging) return
      if (!this.props.allowDrop) return
      this.setState({ inDropZone: false, dropDepth: 0 })

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)

      if (droppedData.cardIds) {
        this.props.moveCardAbove(droppedData.cardIds, this.props.positionWithinLine)
      } else if (droppedData.cardId) {
        this.props.moveCard(droppedData.cardId, this.props.positionWithinLine)
      } else return
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
      const { card, beatId, lineId } = this.props
      return (
        <CardDialog
          cardId={card.id}
          beatId={beatId}
          lineId={lineId}
          closeDialog={this.closeDialog}
        />
      )
    }

    renderPopover = () => () => {
      return (
        <Popover id={`card-popover-${this.props.card.id}`} title={this.props.card.title}>
          <div className="card__popover-wrapper">
            <RichText
              description={this.props.cardDescription}
              className="card__popover-description"
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
      const { card, isSmall } = this.props
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

      return title
    }

    render() {
      const {
        color,
        card,
        isVisible,
        allowDrop,
        last,
        isSmall,
        isMedium,
        orientation,
        beatPosition,
        linePosition,
      } = this.props
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
            onDragEnter={this.handleDragEnter}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
          >
            {this.renderDropZone()}
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
              <Floater
                component={this.renderPopover()}
                open={this.state.hovering}
                placement="left"
                hideArrow
                offset={0}
                styles={{ wrapper: { cursor: 'move' } }}
              >
                <div onClick={this.openDialog}>{this.renderTitle()}</div>
              </Floater>
            </div>
          </div>
        )
      } else {
        const bodyKlass = cx('card__body', {
          'medium-timeline': isMedium,
          vertical: orientation == 'vertical',
        })
        let placement = 'left'
        if (!this.state.dragging && (isSmall || this.hasDetailsToShow())) {
          // sane default placements
          if (isSmall) {
            placement = 'right'
          } else {
            if (orientation === 'horizontal' && Number(beatPosition) <= 2) {
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
        }
        return (
          <div
            ref={this.cardRef}
            className={cx('card__body-wrapper', { lastOne: last })}
            onDragEnter={allowDrop ? this.handleDragEnter : null}
            onDragOver={allowDrop ? this.handleDragOver : null}
            onDragLeave={allowDrop ? this.handleDragLeave : null}
            onDrop={allowDrop ? this.handleDrop : null}
          >
            {this.renderDialog()}
            {this.renderDropZone()}
            <Floater
              hideArrow
              open={this.state.hovering}
              placement={placement}
              component={this.renderPopover()}
              target={`#card-body-${card.id}`}
              styles={{
                options: {
                  zIndex: 1000,
                },
              }}
            >
              <div
                id={`card-body-${card.id}`}
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
            </Floater>
          </div>
        )
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.dragging != nextState.dragging) return true
      if (this.state.dialogOpen != nextState.dialogOpen) return true
      if (this.state.inDropZone != nextState.inDropZone) return true
      if (this.state.hovering != nextState.hovering) return true
      if (this.props.color != nextProps.color) return true
      if (this.props.isVisible != nextProps.isVisible) return true
      if (this.props.card != nextProps.card) return true
      if (this.props.last != nextProps.last) return true
      if (this.props.timelineSize != nextProps.timelineSize) return true

      return false
    }
  }

  Card.propTypes = {
    card: PropTypes.object.isRequired,
    cardDescription: PropTypes.array.isRequired,
    beatId: PropTypes.number.isRequired,
    lineId: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    last: PropTypes.bool.isRequired,
    positionWithinLine: PropTypes.number.isRequired,
    linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    beatPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    moveCard: PropTypes.func.isRequired,
    moveCardAbove: PropTypes.func.isRequired,
    idx: PropTypes.number.isRequired,
    allowDrop: PropTypes.bool.isRequired,
    showControls: PropTypes.bool,
    tags: PropTypes.array,
    timelineSize: PropTypes.string.isRequired,
    orientation: PropTypes.string.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isSmall: PropTypes.bool.isRequired,
    isMedium: PropTypes.bool.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  const CardActions = actions.card
  checkDependencies({
    redux,
    selectors,
    actions,
    CardActions,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          cardDescription: selectors.cardDescriptionByIdSelector(state.present, ownProps.card.id),
          tags: state.present.tags,
          timelineSize: selectors.timelineSizeSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          isVisible: selectors.visibleCardsSelector(state.present)[ownProps.card.id],
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
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
