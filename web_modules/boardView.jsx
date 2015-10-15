/** @jsx React.DOM */

var $ = require('jquery');
var React = require('react');
var BeatListView = require('beatListView');
var LineListView = require('lineListView');
var WholeBoardStore = require('stores/wholeBoardStore');

var Router = require('react-router');
var Link = Router.Link;

var BoardView = React.createClass({

  getInitialState: function() {
    return {
      board: null,
      beats: null,
      lines: null,
      cards: null
    };
  },

  componentWillMount: function() {
    WholeBoardStore.addChangeListener(this.boardLoaded);
    WholeBoardStore.load(this.props.params.boardId);
  },

  componentDidMount: function(){
    this.props.setBoardId(this.props.params.boardId);
  },

  componentWillUnmount: function() {
    WholeBoardStore.removeChangeListener(this.boardLoaded);
  },

  boardLoaded: function(response) {
    this.setState({
      board: WholeBoardStore.getBoard(),
      beats: WholeBoardStore.getBeats(),
      lines: WholeBoardStore.getLines(),
      cards: WholeBoardStore.getCards(),
    });
  },

  render: function() {
    return this.state.board ? this.renderBoard() : this.renderLoading();
  },

  renderBoard: function() {
    return (
      <div>
        <h1>{this.state.board.title}</h1>
        <div>
          <BeatListView beats={this.state.beats} boardId={this.state.board.id}/>
          <LineListView
            lines={this.state.lines}
            boardId={this.state.board.id}
            beatMap={this.beatMapping()}
            cards={this.state.cards} />
          {this.props.activeRouteHandler(this.state)}
        </div>
      </div>
    );
  },

  renderLoading: function() {
    return <p>Loading...</p>;
  },

  beatMapping: function() {
    mapping = {};
    this.state.beats.forEach(function(b){
      mapping[b.position] = b.id;
    });
    return mapping;
  }

});

module.exports = BoardView;
