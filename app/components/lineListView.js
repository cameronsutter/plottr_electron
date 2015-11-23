import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import * as LineActions from '../actions/lines'
import LineView from 'components/lineView'
import 'style!css!sass!../css/line_list_block.css.scss'

class LineListView extends Component {

  handleCreateNewLine () {
    this.props.actions.addLine()
  }

  render () {
    var lineViews = this.renderLines()
    return (<div className='line-list'>
      {lineViews}
      <div className='line-list__new' onClick={this.handleCreateNewLine.bind(this)} />
    </div>)
  }

  renderLines () {
    const lines = _.sortBy(this.props.lines, 'position')
    return lines.map((line) => {
      return (
        <LineView key={'lineId-' + line.id} line={line} sceneMap={this.props.sceneMap} />
      )
    })
  }
}

LineListView.propTypes = {
  lines: PropTypes.array.isRequired,
  sceneMap: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(LineActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineListView)

// var LineListView = React.createClass({
//
//   render: function() {
//     var lineViews = this.state.lines.map(function(line) {
//       return (<LineView
//         line={line}
//         editing={false}
//         cards={this.findCards(this.props.cards, line.id)}
//         beatMap={this.props.beatMap}
//         handleReorder={this.handleReorder}/>);
//     }, this);
//
//     return (<div className="line-list">
//       {lineViews}
//       <div className="line-list__new" onClick={this.handleNewLineClick} />
//     </div>);
//   },
//
//   findCards: function(cards, lineId) {
//     return cards.filter(function(card) {
//       return card.line_id == lineId;
//     });
//   },
//
//   handleNewLineClick: function(e) {
//     var lines = this.state.lines;
//     lines.push({
//       title: this.defaults.title,
//       color: this.defaults.color
//     });
//     this.setState({lines: lines});
//     WholeBoardStore.saveLine({
//       title: this.defaults.title,
//       color: this.defaults.color,
//       board_id: this.props.boardId,
//       position: this.nextPosition()
//     });
//   },
//
//   handleReorder: function(originalLinePosition, droppedLinePosition) {
//     this.state.lines.forEach(function(l){
//       newLine = _.clone(l);
//       if(l.position >= originalLinePosition && l.position != droppedLinePosition){
//         newLine.position += 1;
//       } else if(l.position == droppedLinePosition){
//         newLine.position = originalLinePosition;
//       }
//       WholeBoardStore.saveLine(newLine);
//     });
//   },
//
//   nextPosition: function() {
//     var highest = 0;
//     this.state.lines.forEach(function(line){
//       if(line.position > highest) highest = line.position;
//     });
//     return highest + 1;
//   }
//
// });
