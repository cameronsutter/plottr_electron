/** @jsx React.DOM */

var React = require('react');
var MarkDown = require("pagedown").getSanitizingConverter();

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var ButtonToolbar = RBS.ButtonToolbar;

var CardDescriptionEditor = React.createClass({
  getInitialState: function() {
    return {
      editedDescription: this.props.card.description,
    };
  },

  handleEdit: function() {
    this.props.onRequestOpen();
  },

  handleCancel: function() {
    this.props.onRequestClose();
  },

  handleSave: function() {
    this.props.onRequestSave(this.state.editedDescription);
  },

  handleDescriptionChanged: function(e) {
    this.setState({editedDescription: e.target.value});
  },

  render: function() {
    return this.props.isOpen ? this.renderEditor() : this.renderPlain();
  },

  renderPlain: function() {
    return (
      <div className="card-description-editor"
        onClick={this.handleEdit} >
        <div
          className="card-description-editor__display"
          dangerouslySetInnerHTML={{__html: MarkDown.makeHtml(this.props.card.description)}} >
        </div>
      </div>
    );
  },

  renderMarkDownDescription: function() {
    return this.dangerouslySetInnerHTML();
  },

  renderEditor: function() {
    return (
      <div className="card-description-editor">
        <textarea className="form-control"
          rows="13" value={this.state.editedDescription}
          onChange={this.handleDescriptionChanged} />
        <ButtonToolbar className="card-description-editor__button-bar">
          <Button className="btn btn-success card-description-editor__save"
            onClick={this.handleSave}>
            Save
          </Button>
          <Button className="btn btn-danger card-description-editor__cancel"
            onClick={this.handleCancel}>
            Cancel
          </Button>
        </ButtonToolbar>
      </div>
    );
  },
});

module.exports = CardDescriptionEditor;
