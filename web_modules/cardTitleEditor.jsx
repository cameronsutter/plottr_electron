/** @jsx React.DOM */

var React = require('react');

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var ButtonToolbar = RBS.ButtonToolbar;

var CardTitleEditor = React.createClass({
  getInitialState: function() {
    return {
      editedTitle: this.props.card.title,
    };
  },

  handleEdit: function() {
    this.props.onRequestOpen();
  },

  handleCancel: function() {
    this.props.onRequestClose();
  },

  handleSave: function() {
    this.props.onRequestSave(this.state.editedTitle);
  },

  handleTitleChanged: function(e) {
    this.setState({editedTitle: e.target.value});
  },

  render: function() {
    return this.props.isOpen ? this.renderEditor() : this.renderPlain();
  },

  renderPlain: function() {
    return (
      <div className="card-title-editor"
        onClick={this.handleEdit} >
        <h2 className="card-title-editor__display">
          {this.props.card.title}
        </h2>
      </div>
    );
  },

  renderEditor: function() {
    return (
      <div className="card-title-editor">
        <input className="card-title-editor__input form-control input-lg"
          type="text" value={this.state.editedTitle}
          onChange={this.handleTitleChanged} />
        <ButtonToolbar className="card-title-editor__button-bar">
          <Button className="card-title-editor__save" bsStyle="success"
            onClick={this.handleSave}>
            Save
          </Button>
          <Button className="card-title-editor__cancel" bsStyle="danger"
            onClick={this.handleCancel}>
            Cancel
          </Button>
        </ButtonToolbar>
      </div>
    );
  },
});

module.exports = CardTitleEditor;
