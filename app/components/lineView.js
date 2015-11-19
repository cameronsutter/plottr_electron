import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import CardView from 'components/cardView'
import _ from 'lodash'
import $ from 'jquery'

// import CardView from 'components/cardView'

// var RBS = require('react-bootstrap');
// var Button = RBS.Button;
// var Input = RBS.Input;
// var ButtonToolbar = RBS.ButtonToolbar;
// var Icon = RBS.Glyphicon;
// var Modal = require('react-modal/dist/react-modal');

class LineView extends Component {

  findCard (sceneId) {
    return _.find(this.cards(), (card) => {
      return card.sceneId === sceneId
    })
  }

  lineLength () {
    return this.numberOfScenes() * this.width() + 25
  }

  numberOfScenes () {
    return this.props.scenes.length + 1 // + 2 because of the placeholder and the new (hidden) beats
  }

  height () {
    return 66 / 2
  }

  width () {
    return 150 + 25
  }

  cards () {
    var cards = _.filter(this.props.cards, (card) => {
      return card.lineId === this.props.line.id
    })
    return _.sortBy(cards, 'position')
  }

  renderCards () {
    var sceneMap = this.props.sceneMap

    return Object.keys(sceneMap).map((scenePosition) => {
      var sceneId = sceneMap[scenePosition]
      var card = this.findCard(sceneId)
      var id = card ? card.id : '' + sceneId + scenePosition
      return (<CardView key={id} card={card}
        sceneId={sceneId} lineId={this.props.line.id}
        color={this.props.line.color} />
      )
    })
  }

  render () {
    var lineLength = this.lineLength()
    const { line } = this.props
    return (
      <div className='line' style={{width: (lineLength + this.width())}}>
        <div className='line__title-box'>
          <div className='line__title'>{line.title}</div>
        </div>
        <div className='line__svg-line-box'>
          <svg width={lineLength} >
            <line x1='0' y1={this.height()} x2={lineLength} y2={this.height()} className='line__svg-line' style={{stroke: line.color}} />
          </svg>
        </div>
        <div className='card__box'>
          {this.renderCards()}
        </div>
      </div>
    )
  }
}

LineView.propTypes = {
  line: PropTypes.object.isRequired,
  scenes: PropTypes.array.isRequired,
  sceneMap: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    scenes: state.scenes,
    cards: state.cards
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineView)

// var LineView = React.createClass({
//
//   getInitialState: function() {
//     return {
//       title: this.props.line.title,
//       color: this.props.line.color,
//       height: 66/2,
//       width: 150+25,
//       editing: this.props.editing,
//       dragging: false,
//       dropping: false
//     };
//   },
//
//   findCard: function(cards, beatId) {
//     return _.find(cards, function(card) {
//       return card.beat_id == beatId;
//     });
//   },
//
//   lineLength: function() {
//     return this.numOfBeats() * this.state.width + 25;
//   },
//
//   numOfBeats: function() {
//     return Object.keys(this.props.beatMap).length + 1; // + 2 because of the placeholder and the new (hidden) beats
//   },
//
//   handleStartEdit: function() {
//     this.setState({editing: true});
//   },
//
//   closeModal: function() {
//     this.setState({editing: false});
//   },
//
//   doneEditing: function() {
//     var newColor = this.refs.newColor.getValue();
//     var newTitle = this.refs.newTitle.getValue();
//     this.setState({editing: false, color: newColor, title: newTitle});
//     WholeBoardStore.saveLine({
//       id: this.props.line.id,
//       title: newTitle,
//       color: newColor
//     });
//   },
//
//   handleTitleChange: function(e) {
//     this.setState({title: e.target.value});
//   },
//
//   handleDelete: function() {
//     if(confirm("Are you sure you want to delete " + this.props.line.title + "?")){
//       this.setState({editing: false});
//       WholeBoardStore.deleteLine(this.props.line);
//     }
//   },
//
//   handleDragStart: function(e) {
//     e.dataTransfer.effectAllowed = 'move';
//     e.dataTransfer.setData('text/json', JSON.stringify(this.props.line));
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
//     var droppedLine = JSON.parse(json);
//     if (!droppedLine.id) return;
//
//     this.props.handleReorder(this.props.line.position, droppedLine.position);
//   },
//
//   render: function() {
//     return this.props.line ? this.renderLine() : this.renderLoading();
//   },
//
//   renderLine: function() {
//     var lineLength = this.lineLength();
//     var title = this.state.editing ? this.renderEditor() : this.renderTitle();
//     return (<div className="line" style={{width: (lineLength + this.state.width)}}>
//       {title}
//       <div className="line__svg-line-box">
//         <svg width={lineLength} >
//           <line x1="0" y1={this.state.height} x2={lineLength} y2={this.state.height} className="line__svg-line" style={{stroke: this.state.color}} />
//         </svg>
//       </div>
//       <div className="card__box">
//         {this.renderCards()}
//       </div>
//     </div>);
//   },
//
//   renderEditor: function() {
//     return (<Modal isOpen={true} onRequestClose={this.closeModal}>
//       <h3>Edit Line</h3>
//       <div className="line__title-box__edit form-horizontal" >
//         <Input type='text' labelClassName='col-xs-1' wrapperClassName='col-xs-3' label='Title' defaultValue={this.state.title} ref="newTitle" />
//         <Input type='color' labelClassName='col-xs-1' wrapperClassName='col-xs-3' label='Color' defaultValue={this.state.color} ref="newColor" />
//       </div>
//       <ButtonToolbar className="line__title-box__button-bar">
//         <Button bsStyle="success"
//           onClick={this.doneEditing}>
//           Save
//         </Button>
//         <Button
//           onClick={this.closeModal}>
//           Cancel
//         </Button>
//         <Button bsStyle="danger" onClick={this.handleDelete}><Icon glyph="trash" /></Button>
//       </ButtonToolbar>
//     </Modal>);
//   },
//
//   renderTitle: function() {
//     return (<div className="line__title-box"
//       draggable={true}
//       onDragStart={this.handleDragStart}
//       onDragEnd={this.handleDragEnd}
//       onDragEnter={this.handleDragEnter}
//       onDragOver={this.handleDragOver}
//       onDragLeave={this.handleDragLeave}
//       onDrop={this.handleDrop}
//       onClick={this.handleStartEdit}>
//       <div className="line__title" >{this.state.title}</div>
//     </div>);
//   },
//
//   renderLoading: function() {
//     return <p>Loading...</p>;
//   },
//
//   renderCards: function() {
//     var beatMap = this.props.beatMap;
//
//     return Object.keys(beatMap).map(function(beatPosition){
//       var beatId = beatMap[beatPosition];
//       var card = this.findCard(this.props.cards, beatId);
//       var id = card ? card.id : ""+beatId+beatPosition;
//       return <CardView key={id} card={card}
//         boardId={this.props.line.board_id} beatId={beatId}
//         lineId={this.props.line.id} color={this.state.color} />;
//     }, this);
//   },
//
// });
//
// module.exports = LineView;
