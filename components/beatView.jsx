/** @jsx React.DOM */

var React = require('react');
var BeatView = require('beatView');
var WholeBoardStore = require('stores/wholeBoardStore');

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var Icon = RBS.Glyphicon;

var BeatView = React.createClass({

  getInitialState: function() {
    return {
      title: this.props.beat.title,
      editing: this.props.editing,
      dragging: false,
      dropping: false
    };
  },

  render: function() {
    return this.state.editing ? this.renderEditor() : this.renderBeat();
  },

  renderBeat: function() {
    return (<li className="beat-list__item"
      draggable={true}
      onClick={this.startEditing}
      onDragStart={this.handleDragStart}
      onDragEnd={this.handleDragEnd}
      onDragEnter={this.handleDragEnter}
      onDragOver={this.handleDragOver}
      onDragLeave={this.handleDragLeave}
      onDrop={this.handleDrop}>
      {this.state.title}
    </li>);
  },

  renderEditor: function() {
    return (
      <li className="beat-list__item__editing">
        <div className="input-group input-group-sm">
          <input type="text" className="form-control" defaultValue={this.state.title} ref="newTitle" onKeyUp={this.handleEdit} onFocus={this.handleFocus} autoFocus />
          <span className="input-group-btn">

            <Button bsStyle="success" bsSize="small" onClick={this.finishEditing}><Icon glyph="ok" /></Button>
            <Button bsStyle="danger" bsSize="small" onClick={this.handleDelete}><Icon glyph="trash" /></Button>
          </span>
        </div>
      </li>
    );
  },

  handleFocus: function(e){
    var val = e.target.value;
    e.target.value = "";
    e.target.value = val;
  },

  startEditing: function() {
    this.setState({editing: true});
  },

  handleEdit: function(e) {
    if(e.keyCode == 13){
      this.finishEditing();
    }
  },

  finishEditing: function() {
    this.saveBeat();
    this.setState({editing: false});
  },

  handleDelete: function() {
    if(confirm("Are you sure you want to delete " + this.props.beat.title + "?")){
      this.setState({editing: false});
      WholeBoardStore.deleteBeat(this.props.beat);
    }
  },

  saveBeat: function() {
    var newTitle = this.refs.newTitle.getDOMNode().value;
    var newBeat = {
      id: this.props.beat.id,
      title: newTitle
    };
    this.setState({title: newTitle});
    WholeBoardStore.saveBeat(newBeat);
  },

  handleDragStart: function(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.beat));
    this.setState({dragging: true});
  },

  handleDragEnd: function() {
    this.setState({dragging: false});
  },

  handleDragEnter: function(e) {
    this.setState({dropping: true});
  },

  handleDragOver: function(e) {
    e.preventDefault();
    return false;
  },

  handleDragLeave: function(e) {
    this.setState({dropping: false});
  },

  handleDrop: function(e) {
    e.stopPropagation();
    this.handleDragLeave();

    var json = e.dataTransfer.getData('text/json');
    var droppedBeat = JSON.parse(json);
    if (!droppedBeat.id) return;

    this.props.handleReorder(this.props.beat.position, droppedBeat.position);
  },

});

module.exports = BeatView;
