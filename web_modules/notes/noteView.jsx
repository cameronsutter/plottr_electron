/** @jsx React.DOM */

var React = require('react');
var NavBar = require('navbar');
var WholeBoardStore = require('stores/wholeBoardStore');
var MarkDown = require("pagedown").getSanitizingConverter();

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var ButtonToolbar = RBS.ButtonToolbar;
var Icon = RBS.Glyphicon;
var Input = RBS.Input;


var NoteView = React.createClass({

  getInitialState: function() {
    return {
      title: this.props.note.title,
      description: this.props.note.description,
      editing: false,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      title: nextProps.note.title,
      description: nextProps.note.description
    });
  },

  handleStartEdit: function() {
    this.setState({editing: true});
  },

  handleTitleChange: function() {
    this.setState({title: this.refs.titleInput.getValue()});
  },

  handleDescriptionChange: function() {
    this.setState({description: this.refs.descriptionInput.getValue()});
  },

  doneEditing: function() {
    this.setState({editing: false});
    WholeBoardStore.saveNote({
      id: this.props.note.id,
      title: this.state.title,
      description: this.state.description
    });
  },

  render: function() {
    return this.state.editing ? this.renderEditing() : this.renderViewing();
  },

  renderViewing: function() {
    return (<div className="note" onClick={this.handleStartEdit}>
      <h3>{this.state.title}</h3>
      <div
        className="note__description"
        dangerouslySetInnerHTML={{__html: MarkDown.makeHtml(this.state.description)}} >
      </div>
    </div>);
  },

  renderEditing: function() {
    return (<div className="note">
      <Input type="text" value={this.state.title} label="Title" onChange={this.handleTitleChange} ref='titleInput' />
      <Input type='textarea' value={this.state.description} rows="13" label='The text of your note' onChange={this.handleDescriptionChange} ref='descriptionInput' />
      <ButtonToolbar className="line__title-box__button-bar">
        <Button
          onClick={this.doneEditing}>
          Done
        </Button>
        <Button bsStyle="danger" onClick={this.handleDelete}><Icon glyph="trash" /></Button>
      </ButtonToolbar>
    </div>);
  },

});

module.exports = NoteView;