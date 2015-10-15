/** @jsx React.DOM */

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var BoardListStore = require('stores/boardListStore');

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var Icon = RBS.Glyphicon;

var BoardList = React.createClass({
  mixins: [Router.Navigation],

  getInitialState: function() {
    return {
      boards: null
    };
  },

  componentWillMount: function() {
    BoardListStore.subscribe(this.setBoardListState);
  },

  componentDidMount: function(){
    this.props.setBoardId(null);
  },

  componentWillUnmount: function() {
    BoardListStore.removeChangeListener(this.setBoardListState);
  },

  setBoardListState: function() {
    this.setState(BoardListStore.getState());
  },

  goToEditView: function(e) {
    this.transitionTo("boardEditor", {boardId: e.target.value});
  },

  goToExport: function(e) {
    var val = e.target.value
    if(!val){
      val = $(e.target).parent().val()
    }
    location.href = '/api/boards/' + val + '/export'
  },

  render: function() {
    return this.state.boards ? this.renderBoards() : this.renderLoading();
  },

  renderBoards: function() {
    var boardsListItems = this.state.boards.map(function(board){
      return (
        <li className="board-list__item" key={board.id}>
          <Button bsSize="small" className="board-list__item-link" onClick={this.goToExport} value={board.id}><Icon glyph="download-alt" /></Button>
          <Button bsSize="small" className="board-list__item-link" onClick={this.goToEditView} value={board.id}>Change Title</Button>
          <Link className="board-list__item-link" to="boardView" params={{boardId: board.id}}>
            {board.title}
          </Link>
        </li>
      );
    }, this);

    return (
      <div className="board-list">
        <h1>Boards</h1>
        <Link to="boardEditor" params={{boardId: "new"}} className="board-list__new-board-link">New Board</Link>
        <ul className="board-list">{boardsListItems}</ul>
      </div>
    );
  },

  renderLoading: function() {
    return <p>Loading...</p>;
  }
});

module.exports = BoardList;
