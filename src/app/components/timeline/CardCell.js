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
      <RichText
        description={this.props.card.description}
        editable={false}
        className='card__popover-description'
        darkMode={this.props.ui.darkMode}
      />
      {this.renderTags()}
    </Popover>
  }

  hasLabels () {
    const { card } = this.props
    return card.tags && card.tags.length > 0
  }

  renderTags () {
    var tags = null
    if (this.props.card.tags) {
      tags = this.props.card.tags.map(tId => {
        var tag = _.find(this.props.tags, {id: tId})
        if (!tag) return null
        return <TagLabel tag={tag} key={`timeline-taglabel-${tId}`} />
      })
    }
    return (<div className='card__popover-labels'>
      {tags}
    </div>)
  }

  renderTitle () {
    let title = <div className='card__title'>
      {this.props.card.title}
    </div>
    if (!this.state.dragging && (this.hasLabels() || this.props.card.description)) {
      let placement = 'left'
      if (this.props.ui.orientation === 'horizontal') {
        placement = this.props.chapterPosition <= 1 ? 'right' : placement
      } else {
        placement = this.props.linePosition <= 1 ? 'right' : placement
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
  linePosition: PropTypes.number.isRequired,
  chapterPosition: PropTypes.number.isRequired
}

function mapStateToProps (state, ownProps) {
  let line
  let chapter
  if (state.ui.currentTimeline == 'series') {
    line = state.seriesLines.find(l => l.id === ownProps.lineId)
    chapter = state.beats.find(b => b.id === ownProps.chapterId)
  } else {
    line = state.lines.find(l => l.id === ownProps.lineId)
    chapter = state.chapters.find(s => s.id === ownProps.chapterId)
  }
  return {
    tags: state.tags,
    ui: state.ui,
    linePosition: line.position,
    chapterPosition: chapter.position,
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
