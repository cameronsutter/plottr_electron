import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as CardActions from 'actions/cards'
import CardDialog from 'components/timeline/CardDialog'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import TagLabel from 'components/tagLabel'
import { isZoomed } from 'helpers/zoom'
import RichText from '../rce/RichText'
import cx from 'classnames'

class Card extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dialogOpen: false,
      dragging: false,
    }
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleDragStart = (e) => {
    this.setState({dragging: true})
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify({cardId: this.props.card.id}))
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  openDialog = () => {
    this.setState({dialogOpen: true})
  }

  renderDialog () {
    if (!this.state.dialogOpen) return null
    const { card, chapterId, lineId } = this.props
    return <CardDialog
      card={card}
      chapterId={chapterId}
      lineId={lineId}
      closeDialog={this.closeDialog}
    />
  }

  renderPopover () {
    return <Popover title={this.props.card.title} id={`card-popover-${this.props.card.id}`}>
      <div className='card__popover-wrapper'>
        <RichText
          description={this.props.card.description}
          editable={false}
          className='card__popover-description'
          darkMode={this.props.ui.darkMode}
        />
        {this.renderTags()}
      </div>
    </Popover>
  }

  // TODO: this should be a selector
  hasDetailsToShow () {
    const { card } = this.props

    if (card.tags && card.tags.length) return true

    if (!card.description) return false
    if (!card.description.length) return false
    if (card.description.length > 1) return true

    // if it only has one blank paragraph
    if (card.description.length == 1 && card.description[0] && card.description[0].children
      && card.description[0].children.length == 1 && card.description[0].children[0]
      && card.description[0].children[0].text == '') return false

    return true
  }

  renderTags () {
    const { card, tags } = this.props
    if (!card.tags || !card.tags.length) return null

    const tagLabels = card.tags.map(tId => {
      const tag = tags.find(t => t.id == tId)
      if (!tag) return null
      return <TagLabel tag={tag} key={`taglabel-${tId}`} />
    })

    return <div className='card__popover-labels'>{ tagLabels }</div>
  }

  renderTitle () {
    let title = <div className='card__title'>
      {this.props.card.title}
    </div>
    if (!this.state.dragging && this.hasDetailsToShow()) {
      let placement = 'left'
      if (this.props.ui.orientation === 'horizontal') {
        placement = Number(this.props.chapterPosition) <= 2 ? 'right' : placement
      } else {
        placement = Number(this.props.linePosition) <= 2 ? 'right' : placement
      }
      if (isZoomed(this.props.ui)) placement = 'right'
      title = <OverlayTrigger placement={placement} overlay={this.renderPopover()}>
        {title}
      </OverlayTrigger>
    }

    return title
  }

  render () {
    var cardStyle = {
      borderColor: this.props.color
    }
    if (this.state.dragging) {
      cardStyle.opacity = '0.5'
    }
    if (this.props.filtered) {
      cardStyle.opacity = '0.1'
    }

    return <div className={cx('card__body-wrapper', {lastOne: this.props.last})}>
      { this.renderDialog() }
      <div className='card__body' style={cardStyle}
        draggable
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        onClick={this.openDialog}
      >
        { this.renderTitle() }
      </div>
    </div>
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.dragging != nextState.dragging) return true
    if (this.state.dialogOpen != nextState.dialogOpen) return true
    if (this.props.color != nextProps.color) return true
    if (this.props.filtered != nextProps.filtered) return true
    if (this.props.card != nextProps.card) return true
    if (this.props.last != nextProps.last) return true

    return false
  }
}

Card.propTypes = {
  cards: PropTypes.array,
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  last: PropTypes.bool.isRequired,
  tags: PropTypes.array,
  ui: PropTypes.object.isRequired,
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  chapterPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

function mapStateToProps (state, ownProps) {
  return {
    tags: state.present.tags,
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Card)
