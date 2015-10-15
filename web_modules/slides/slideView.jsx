/** @jsx React.DOM */

var React = require('react');
var MarkDown = require("pagedown").getSanitizingConverter();


var SlideView = React.createClass({

  getInitialState: function() {
    return {
      card: this.props.card
    };
  },

  render: function() {
    return (
      <div className="slide">
        <h5>{this.state.card.title}</h5>
        <div
          className="slide__card-description"
          dangerouslySetInnerHTML={{__html: MarkDown.makeHtml(this.state.card.description)}} >
        </div>
      </div>
    );
  }

});

module.exports = SlideView;