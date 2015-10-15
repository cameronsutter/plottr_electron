/** @jsx React.DOM */

var React = require('react');
var Router = require('react-router');
var Modal = require('react-modal/dist/react-modal');
var _ = require('lodash');

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var ButtonToolbar = RBS.ButtonToolbar;
var DropdownButton = RBS.DropdownButton;
var MenuItem = RBS.MenuItem;

var WholeBoardStore = require('stores/wholeBoardStore');
var CardTitleEditor = require('cardTitleEditor');
var CardDescriptionEditor = require('cardDescriptionEditor');

var CardDialog = React.createClass({
  mixins: [Router.Navigation],

  getInitialState: function() {
    return {
      beats: WholeBoardStore.getBeats(),
      lines: WholeBoardStore.getLines(),
      isNewCard: this.props.isNewCard,
      activeEditor: null,
      editedCard: this.props.card,
    };
  },


  newCard: {
    title: 'New Card',
    description: 'Click to edit'
  },

  componentDidMount: function() {
    if(this.state.isNewCard){
      var card = _.clone(this.newCard);
      card.beat_id = this.props.beatId;
      card.line_id = this.props.lineId;
      this.setState({editedCard: card});
    }
  },

  setEditedCardState: function(nextCardState) {
    var nextCard = _.clone(this.state.editedCard);
    _.assign(nextCard, nextCardState);
    this.setState({
      editedCard: nextCard,
    }, function() {
      if (this.state.editedCard.id)
        this.saveEditedCard();
    });

  },

  closeModal: function() {
    this.props.closeEditor();
  },

  handleCreate: function() {
    this.saveEditedCard().done(this.closeModal);
  },

  openTitle: function() {
    if (!this.state.activeEditor)
      this.setState({activeEditor: "title"});
  },

  closeEditor: function() {
    this.setState({activeEditor: null});
  },

  saveTitle: function(nextTitle) {
    this.setEditedCardState({title: nextTitle});
    this.setState({activeEditor: null});
  },

  isTitleOpen: function() {
    return this.state.activeEditor === "title";
  },

  openDescription: function() {
    if (!this.state.activeEditor)
      this.setState({activeEditor: "description"});
  },

  saveDescription: function(nextDescription) {
    this.setEditedCardState({description: nextDescription});
    this.setState({activeEditor: null});
  },

  isDescriptionOpen: function() {
    return this.state.activeEditor === "description";
  },

  saveEditedCard: function() {
    return WholeBoardStore.saveCard(this.state.editedCard);
  },

  getCurrentBeat: function() {
    return _.find(this.state.beats, function(beat) {
      return beat.id === this.props.beatId;
    }.bind(this));
  },

  getCurrentLine: function() {
    return _.find(this.state.lines, function(line) {
      return line.id === this.props.lineId;
    }.bind(this));
  },

  deleteCard: function() {
    if (!this.state.editedCard.id) return;
    WholeBoardStore.deleteCard(this.state.editedCard);
    this.closeModal();
  },

  renderButtonBar: function() {
    if (this.state.isNewCard) {
      return (
        <ButtonToolbar className="card-dialog__button-bar-create">
          <Button className="card-dialog__create" bsStyle="success"
            onClick={this.handleCreate}>
            Create
          </Button>
          <Button className="card-dialog__cancel" bsStyle="danger"
            onClick={this.closeModal}>
            Cancel
          </Button>
        </ButtonToolbar>
      );
    } else {
      return (
        <div className="card-dialog__button-bar-edit">
          <Button className="card-dialog__close"
            bsStyle="primary"
            onClick={this.closeModal}>
            Close
          </Button>
          <Button className="card-dialog__delete" bsStyle="danger"
            onClick={this.deleteCard} >
            Delete
          </Button>
        </div>
      );
    }
  },

  renderBeatItems: function() {
    return this.state.beats.reduce(function(elts, beat) {
      elts.push(
        <MenuItem
          key={beat.id}
          onSelect={this.setEditedCardState.bind(this, {beat_id: beat.id})}
          >
          {beat.title}
        </MenuItem>
      );
      return elts;
    }.bind(this), []);
  },

  renderLineItems: function() {
    return this.state.lines.reduce(function(elts, line) {
      elts.push(
        <MenuItem
          key={line.id}
          onSelect={this.setEditedCardState.bind(this, {line_id: line.id})}
          >
          {line.title}
        </MenuItem>
      );
      return elts;
    }.bind(this), []);
  },

  render: function() {
    var ids = {
      beat: _.uniqueId("select-beat-"),
      line: _.uniqueId("select-line-"),
    };

    return (
      <Modal isOpen={true} onRequestClose={this.closeModal}>
        <div className="card-dialog">
          <div className="card-dialog__title">
            <CardTitleEditor card={this.state.editedCard || this.newCard}
              isOpen={this.isTitleOpen()}
              onRequestOpen={this.openTitle}
              onRequestClose={this.closeEditor}
              onRequestSave={this.saveTitle} />
          </div>
          <div className="card-dialog__position-details">
            <div className="card-dialog__line">
              <label className="card-dialog__line-label" htmlFor={ids.line}>Line:
                <DropdownButton id={ids.line} className="card-dialog__select-line" title={this.getCurrentLine().title}>
                  {this.renderLineItems()}
                </DropdownButton>
              </label>
            </div>
            <div className="card-dialog__beat">
              <label className="card-dialog__beat-label" htmlFor={ids.beat}>Beat:
                <DropdownButton id={ids.beat} className="card-dialog__select-beat" title={this.getCurrentBeat().title}>
                  {this.renderBeatItems()}
                </DropdownButton>
              </label>
            </div>
          </div>
          <div className="card-dialog__description">
            <CardDescriptionEditor card={this.state.editedCard || this.newCard}
              isOpen={this.isDescriptionOpen()}
              onRequestOpen={this.openDescription}
              onRequestClose={this.closeEditor}
              onRequestSave={this.saveDescription} />
          </div>
          {this.renderButtonBar()}
        </div>
      </Modal>
    );
  },
});

module.exports = CardDialog;
