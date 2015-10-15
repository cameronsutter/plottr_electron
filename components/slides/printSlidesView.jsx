/** @jsx React.DOM */

var _ = require('lodash');
var React = require('react');

var SlideView = require('slides/slideView');
var SlideFeedbackView = require('slides/slideFeedbackView');
var WholeBoardStore = require('stores/wholeBoardStore');

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var DropdownButton = RBS.DropdownButton;
var MenuItem = RBS.MenuItem;
var Icon = RBS.Glyphicon;


var PrintSlidesView = React.createClass({

  getInitialState: function() {
    return {
      board: null,
      beats: null,
      lines: null,
      cards: null,
      currentLineId: +this.props.params.lineId,
      beatIdsForLine: null,
      currentBeatIdIndex: 0,
      finished: false,
      cardsWithPosition: null
    };
  },

  componentWillMount: function() {
    WholeBoardStore.addChangeListener(this.boardLoaded);
    WholeBoardStore.load(this.props.params.boardId);
  },

  componentDidMount: function(){
    this.props.setBoardId(this.props.params.boardId);
  },

  componentWillUnmount: function() {
    WholeBoardStore.removeChangeListener(this.boardLoaded);
  },

  boardLoaded: function(response) {
    this.setState({
      board: WholeBoardStore.getBoard(),
      beats: WholeBoardStore.getBeats(),
      lines: WholeBoardStore.getLines(),
      cards: WholeBoardStore.getCards()
    });
    this.sortCards();
  },

  sortCards: function() {
    var cards = this.getCardsForCurrentLine();
    var cardsWithPosition = this.addPositionToCards(cards);
    var sorted = _.sortBy(cardsWithPosition, 'position');
    this.setState({cardsWithPosition: sorted});
  },

  addPositionToCards: function(cards) {
    var beats = this.state.beats;
    return cards.map(function(card){
      card.position = _.find(beats, {id: card.beat_id}).position;
      return card;
    });
  },

  getCurrentLine: function() {
    return _.find(this.state.lines, {id: this.state.currentLineId});
  },

  getCardsForCurrentLine: function() {
    return _.filter(this.state.cards, {line_id: this.state.currentLineId});
  },

  getBeat: function(beatId) {
    return _.find(this.state.beats, {id: beatId});
  },

  advanceSlide: function() {
    this.findNextCardForLine(true);
  },

  regressSlide: function() {
    this.findNextCardForLine(false);
  },

  startOver: function() {
    this.setState({currentBeatIdIndex: 0, finished: false});
  },

  findNextCardForLine: function(increasing) {
    var beatIdIndex = this.state.currentBeatIdIndex;
    if(increasing){
      if(beatIdIndex < (this.state.beatIdsForLine.length - 1)) {
        beatIdIndex++;
      }else{
        this.setState({finished: true});
      }
    }else{
      if(beatIdIndex > 0) beatIdIndex--;
    }
    this.setState({currentBeatIdIndex: beatIdIndex});
  },

  getCardForBeat: function(cards, beatId) {
    return _.find(cards, {beat_id: beatId});
  },

  handleKeyDown: function(e) {
    console.log(e.which);
  },

  render: function() {
    return this.state.board ? this.renderBoard() : this.renderLoading();
  },

  renderBoard: function() {
    var currentLine = this.getCurrentLine();
    return (
      <div>
        <h1>{this.state.board.title}</h1>
        <h3>{currentLine.title}</h3>
        <div className="slide-create__slide-container">
          {this.renderCards()}
        </div>
      </div>
    );
  },

  renderLoading: function() {
    return <p>Loading...</p>;
  },

  renderCards: function() {
    var cards = this.state.cardsWithPosition;
    if(!cards) return this.renderLoading();
    beats = this.state.beats;
    return cards.map(function(card){
      return (<div className="slide-print__slide">
        <h3>{_.find(beats, {id: card.beat_id}).title}</h3>
        <SlideView key={card.id} card={card} />
      </div>)
    });
  },

});

module.exports = PrintSlidesView;