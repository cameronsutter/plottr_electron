/** @jsx React.DOM */

var React = require('react');
var Link = require('react-router').Link;

NavBar = React.createClass({
  render: function () {
    return (
      <nav className="navbar navbar-default navbar-fixed-top" role="navigation">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse-1">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link to="root" className="navbar-brand">Plottr</Link>
        </div>
        {this.renderLinks()}
      </nav>
    );
  },

  renderLinks: function() {
    if(!this.props.boardId) return null;
    return (
      <div className="collapse navbar-collapse" id="navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li><Link to="boardView" params={{boardId: this.props.boardId}}>Timeline</Link></li>
          <li><Link to="noteView" params={{boardId: this.props.boardId}}>Notes</Link></li>
          <li><Link to="slideCreateView" params={{boardId: this.props.boardId}}>Slides</Link></li>
        </ul>
      </div>
    );
  },
});

module.exports = NavBar;
