/** @jsx React.DOM */

var React = require('react');
var NavBar = require('navbar');

var Plottr = React.createClass({

  getInitialState: function() {
    return {
      boardId: null
    };
  },

  setBoardId: function(id) {
    this.setState({boardId: id});
  },

  render: function() {
    return (
      <div className="main">
        <NavBar boardId={this.state.boardId} />
        <this.props.activeRouteHandler setBoardId={this.setBoardId} />
      </div>
    );
  },
});

module.exports = Plottr;
