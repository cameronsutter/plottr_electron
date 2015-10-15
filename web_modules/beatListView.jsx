/** @jsx React.DOM */

var _ = require('lodash');
var React = require('react');
var BeatView = require('beatView');
var WholeBoardStore = require('stores/wholeBoardStore');

var RBS = require('react-bootstrap');
var Icon = RBS.Glyphicon;

var BeatListView = React.createClass({

  defaults: {
    title: "Click to Edit"
  },

  getInitialState: function() {
    return { beats: this.props.beats };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({beats: nextProps.beats});
  },

  renderBeats: function() {
    return this.state.beats.map(function(beat) {
      return <BeatView key={beat.id} beat={beat} editing={false} handleReorder={this.handleReorder} />;
    }.bind(this));
  },

  render: function() {
    return (
      <ul className="beat-list">
        <li className="beat-list__placeholder" />
        {this.renderBeats()}
        <li className="beat-list__new" onClick={this.handleNewBeatClick} />
      </ul>
    );
  },

  handleNewBeatClick: function() {
    var beats = this.state.beats;
    beats.push({
      title: this.defaults.title
    });
    this.setState({beats: beats});
    WholeBoardStore.saveBeat({
      title: this.defaults.title,
      board_id: this.props.boardId,
      position: this.nextPosition()
    });
  },

  handleReorder: function(originalBeatPosition, droppedBeatPosition) {
    this.state.beats.forEach(function(b){
      newBeat = _.clone(b);
      if(b.position >= originalBeatPosition && b.position != droppedBeatPosition){
        newBeat.position += 1;
      } else if(b.position == droppedBeatPosition){
        newBeat.position = originalBeatPosition;
      }
      WholeBoardStore.saveBeat(newBeat);
    });
  },

  nextPosition: function() {
    var highest = 0;
    this.state.beats.forEach(function(beat){
      if(beat.position > highest) highest = beat.position;
    });
    return highest + 1;
  }
});

module.exports = BeatListView;
