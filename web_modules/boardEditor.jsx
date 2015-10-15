/** @jsx React.DOM */

var _ = require('lodash');
var React = require('react');
var Router = require('react-router');
var BoardListStore = require('stores/boardListStore');

var BoardEditor = React.createClass({

  mixins: [Router.Navigation],

  getInitialState: function() {
    return {
      board: null
    };
  },

  componentWillMount: function() {
    if (this.props.params.boardId == 'new') {
      this.setState({board: {title: 'New Board'}});
    }
    else {
      BoardListStore.subscribe(this.setBoardState);
    }
  },

  componentWillUnmount: function() {
    BoardListStore.removeChangeListener(this.setBoardState);
  },

  setBoardState: function() {
    this.setState({board: BoardListStore.getBoard(parseInt(this.props.params.boardId))});
  },

  handleChange: function(e) {
    var newBoard = _.cloneDeep(this.state.board);
    newBoard.title = e.target.value;
    this.setState({board: newBoard});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    BoardListStore.saveBoard(this.state.board);
    this.transitionTo('boardList');
  },

  render: function() {
    return this.state.board ? this.renderEdit() : this.renderLoading();
  },

  renderEdit: function() {
    ids = {
      title: _.uniqueId("board-title-"),
    };

    return (
      <div>
        <h1>Board {this.state.board.title}</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label className="control-label" htmlFor={ids.title}>Board Title</label>
            <input id={ids.title} type="text" className="form-control" placeholder="Board Title"
              value={this.state.board.title}
              onChange={this.handleChange} />
          </div>
          <button type="submit" className="btn btn-success">Save</button>
        </form>
      </div>
    );
  },

  renderLoading: function() {
    return <p>Loading...</p>;
  }
});

module.exports = BoardEditor;
