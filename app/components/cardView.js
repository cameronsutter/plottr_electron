import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CardDialog from 'components/cardDialog'
import * as CardActions from '../actions/cards'
import 'style!css!sass!../css/card_block.css.scss'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, creating: false}
  }

  render () {
    return this.state.dialogOpen ? this.renderDialog() : this.renderShape()
  }

  renderShape () {
    return this.props.card ? this.renderCard() : this.renderBlank()
  }

  renderCard () {
    var cardStyle = {
      borderColor: this.props.color
    }
    return (<div className='card__real' style={cardStyle} onClick={() => this.setState({dialogOpen: true})} >
        <div className='card__title'>{this.props.card.title}</div>
    </div>)
  }

  renderBlank () {
    var cardClass = 'card__blank'
    // if (this.state.dropping)
    //   cardClass += ' card__hover'

    return (
      <div className={cardClass}
        style={{borderColor: this.props.color}}
      ></div>
    )
  }

  renderDialog () {
    const { card, sceneId, lineId } = this.props
    var key = 'new' + sceneId + lineId
    if (card) key = card.id
    return (<CardDialog
      key={key}
      card={card}
      sceneId={sceneId}
      lineId={lineId}
      isNewCard={this.state.creating}
      closeEditor={this.closeEditor} />)
  }

}

CardView.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView)

//
//   render: function() {
//     return this.props.card ? this.renderCard() : this.renderBlank();
//   },
//
//   renderCard: function() {
//     return this.state.dialogOpen ? this.renderDialog() : this.renderNormalCard();
//   },
//
//   renderDialog: function() {
//     var key = "new"+this.props.beatId+this.props.lineId;
//     if(this.props.card) key = this.props.card.id;
//     return (<CardDialog
//       key={key}
//       card={this.props.card}
//       beatId={this.props.beatId}
//       lineId={this.props.lineId}
//       boardId={this.props.boardId}
//       isNewCard={this.state.creating}
//       closeEditor={this.closeEditor} />);
//   },
//
//   renderNormalCard: function() {
//     var cardStyle = {
//       borderColor: this.state.color,
//     };
//     if (this.state.dragging)
//       cardStyle.opacity = "0.5";
//
//     return (
//       <div className="card__real" style={cardStyle}
//         draggable={true}
//         onClick={this.handleClick}
//         onDragStart={this.handleDragStart}
//         onDragEnd={this.handleDragEnd} >
//       <div className="card__title">{this.props.card.title}</div>
//     </div>);
//   },
//
//   renderBlank: function() {
//     return this.state.dialogOpen ? this.renderDialog() : this.renderBlankCard();
//   },
//
//   renderBlankCard: function() {
//     var cardClass = "card__blank"
//     if (this.state.dropping)
//       cardClass += " card__hover";
//
//     return (
//       <div className={cardClass}
//         style={{borderColor: this.state.color}}
//         onClick={this.handleBlankClick}
//         onDragEnter={this.handleDragEnter}
//         onDragOver={this.handleDragOver}
//         onDragLeave={this.handleDragLeave}
//         onDrop={this.handleDrop}
//       ></div>
//     );
//   },
//
//   handleClick: function() {
//     this.setState({dialogOpen: true});
//   },
//
//   closeEditor: function() {
//     this.setState({dialogOpen: false});
//   },
//
//   handleBlankClick: function() {
//     this.setState({creating: true, dialogOpen: true});
//   },
//
//   handleDragStart: function(e) {
//     e.dataTransfer.effectAllowed = 'move';
//     e.dataTransfer.setData('text/json', JSON.stringify(this.props.card));
//     this.setState({dragging: true});
//   },
//
//   handleDragEnd: function() {
//     this.setState({dragging: false});
//   },
//
//   handleDragEnter: function(e) {
//     this.setState({dropping: true});
//   },
//
//   handleDragOver: function(e) {
//     e.preventDefault();
//     return false;
//   },
//
//   handleDragLeave: function(e) {
//     this.setState({dropping: false});
//   },
//
//   handleDrop: function(e) {
//     e.stopPropagation();
//     this.handleDragLeave();
//
//     var json = e.dataTransfer.getData('text/json');
//     var droppedCard = JSON.parse(json);
//     if (!droppedCard.id) return;
//
//     droppedCard.line_id = this.props.lineId;
//     droppedCard.beat_id = this.props.beatId;
//     WholeBoardStore.saveCard(droppedCard);
//   },
//
// });
//
// module.exports = CardView;
