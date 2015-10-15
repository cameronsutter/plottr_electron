/** @jsx React.DOM */

var _ = require('lodash');
var React = require('react');
var NavBar = require('navbar');
var WholeBoardStore = require('stores/wholeBoardStore');
var MarkDown = require("pagedown").getSanitizingConverter();

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var Icon = RBS.Glyphicon;


var NoteNavigator = React.createClass({

  getInitialState: function() {
    return {
      notes: this.findDepth(this.props.notes)
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      notes: this.findDepth(nextProps.notes)
    });
  },

  newNote: {
    title: "a new note",
    description: "this is going to be good. I can tell",
    parent_id: null
  },

  findDepth: function(notes) {
    var notesById = _.indexBy(notes, 'id');
    notes = [];
    _.forIn(notesById, function(note, noteId){
      if(note.parent_id == null){
        note.depth = 0;
      } else {
        var parent = true;
        var depth = 1;
        var currentNote = note;
        while(parent){
          var newNote = notesById[currentNote.parent_id];
          if(newNote.parent_id == null && newNote.parent_id != newNote.id){
            parent = false;
            note.depth = depth;
          } else {
            depth++;
            currentNote = newNote;
          }
        }
      }
      notes.push(note);
    });
    return this.findOrder(notes);
  },

  findOrder: function(notes) {
    var tree = this.makeNoteTrees(notes);
    this.walkTree(tree.tree, notes, 0);
    return _.sortBy(notes, 'order');
  },

  walkTree: function(tree, notes, order) {
    if(tree.length == 0) return order;
    tree.forEach(function(child){
      _.find(notes, {id: child.data.id}).order = order;
      order = this.walkTree(child.children, notes, order+1);
    }.bind(this));
    return order;
  },

  makeNoteTrees: function(notes) {
    if(!notes) return {tree: null, byId: null};
    var roots = [];
    var notesById = [];
    //to object
    notes.forEach(function(note){
      notesById[note.id] = {
        data: note,
        children: []
      };
    });
    var clone = _.cloneDeep(notesById);
    //add to parents
    notesById.forEach(function(note) {
      if(note.data.parent_id != null) {
        notesById[note.data.parent_id].children.push(note);
      }
    });
    //pull out the roots
    roots = notesById.filter(function(note) {
      return note.data.parent_id == null;
    });
    return {tree: roots, byId: clone};
  },

  handleNoteClick: function(e) {
    var id = e.target.getAttribute("value");
    var note = _.find(this.state.notes, {id: +id});
    this.props.updateCurrentNote(note);
  },

  insertNewNote: function() {
    var newNote = _.cloneDeep(this.newNote);
    newNote["board_id"] = this.props.boardId;
    WholeBoardStore.saveNote(newNote);
  },

  handleDelete: function() {
    if(confirm("Are you sure you want to delete '" + this.state.title + "'?")){
      this.setState({editing: false});
      WholeBoardStore.deleteNote(this.props.note);
    }
  },

  handleDragStart: function(e) {
    var id = e.target.getAttribute("value");
    var note = _.find(this.state.notes, {id: +id});
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/json', JSON.stringify(note));
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
    var droppedNote = JSON.parse(json);
    if (!droppedNote.id) return;

    var newParentId = e.target.getAttribute("value");
    droppedNote.parent_id = +newParentId;
    WholeBoardStore.saveNote(droppedNote);
  },

  render: function() {
    return (<div className="note-navigator__box">
      <h2>Notes</h2>
      <hr />
      {this.renderTree(this.state.notes)}
      <hr />
      <Button onClick={this.insertNewNote}><Icon glyph="plus"/></Button>
    </div>);
  },

  renderTree: function(tree) {
    if(!tree) return this.renderEmptyTree();

    return tree.map(function(node){
      return this.renderNode(node);
    }.bind(this));
  },

  renderNode: function(node, glyph) {

    var renderPlaceholders = function(depth) {
      var placeholders = [];
      for(var i = 0; i < depth; i++) {
        var glyph = null;
        if(depth == i + 1) glyph = <Icon glyph="minus" />;
        placeholders.push(<div className="note-navigator__placeholder" >{glyph}</div>);
      }
      return placeholders;
    };

    return (<div
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}>
      <div className="note-navigator__node">
        {renderPlaceholders(node.depth)}
        <div className="note-navigator__title"
          draggable={true}
          onClick={this.handleNoteClick}
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          value={node.id}>{node.title}</div>
      </div>
    </div>);
  },


});

module.exports = NoteNavigator;


// var notes = [{id: 0, title: "", description: "", parent_id: null}, {id: 1, title: "", description: "", parent_id: 0}, {id: 2, title: "", description: "", parent_id: null}, {id: 3, title: "", description: "", parent_id: 2}, {id: 4, title: "", description: "", parent_id: 3}, {id: 5, title: "", description: "", parent_id: 3}, {id: 6, title: "", description: "", parent_id: 5}, {id: 7, title: "", description: "", parent_id: 3}]