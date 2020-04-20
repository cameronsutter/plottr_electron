import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import CardDialog from 'components/timeline/CardDialog'
import CardSVGline from 'components/timeline/CardSVGline'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import TagLabel from 'components/tagLabel'
import { isZoomed } from 'helpers/zoom'
import RichText from '../rce/RichText'

class CardCell extends Component {
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
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.card))
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
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
    if (card.description.length > 1) return true // more than 1 paragraph
    if (card.description[0].children.length > 1) return true // more than 1 text node
    if (card.description[0].children[0].text == '') return false // no text

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
        placement = Number(this.props.chapterPosition) <= 1 ? 'right' : placement
      } else {
        placement = Number(this.props.linePosition) <= 1 ? 'right' : placement
      }
      if (isZoomed(this.props.ui)) placement = 'right'
      title = <OverlayTrigger placement={placement} overlay={this.renderPopover()}>
        {title}
      </OverlayTrigger>
    }

    return title
  }

  renderBody () {
    var cardStyle = {
      borderColor: this.props.color
    }
    if (this.state.dragging) {
      cardStyle.opacity = '0.5'
    }
    if (this.props.filtered) {
      cardStyle.opacity = '0.1'
    }

    return <div className='card__body' style={cardStyle}
      draggable={true}
      onDragStart={this.handleDragStart}
      onDragEnd={this.handleDragEnd}
      onClick={() => this.setState({dialogOpen: true})}
    >
      {this.renderTitle()}
    </div>
  }

  render () {
    return <Cell>
      <div className='card__cell'>
        <CardSVGline color={this.props.color} orientation={this.props.ui.orientation}/>
        { this.renderBody() }
        { this.renderDialog() }
      </div>
    </Cell>
  }
}

CardCell.propTypes = {
  card: PropTypes.object,
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  tags: PropTypes.array,
  ui: PropTypes.object.isRequired,
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  chapterPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

function mapStateToProps (state, ownProps) {
  return {
    tags: state.tags,
    ui: state.ui,
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
)(CardCell)
