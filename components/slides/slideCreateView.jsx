/** @jsx React.DOM */

var _ = require('lodash');
var React = require('react');
var Router = require('react-router');

var SlideView = require('slides/slideView');
var SlideFeedbackView = require('slides/slideFeedbackView');
var WholeBoardStore = require('stores/wholeBoardStore');

var RBS = require('react-bootstrap');
var Button = RBS.Button;
var DropdownButton = RBS.DropdownButton;
var MenuItem = RBS.MenuItem;
var Icon = RBS.Glyphicon;


var SlideCreateView = React.createClass({
  mixins: [Router.Navigation],

  getInitialState: function() {
    return {
      board: null,
      beats: null,
      lines: null,
      cards: null,
      currentLineId: null,
      beatIdsForLine: null,
      currentBeatIdIndex: 0
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
    theLines = WholeBoardStore.getLines();
    this.setState({
      board: WholeBoardStore.getBoard(),
      beats: WholeBoardStore.getBeats(),
      lines: theLines,
      cards: WholeBoardStore.getCards(),
      currentLineId: theLines[0].id
    });
    this.initBeatState();
  },

  initBeatState: function(lineId) {
    var lineId = lineId || this.state.currentLineId;
    var cards = this.getCardsForLine(lineId);
    var cardsWithPosition = this.addPositionToCards(cards);
    var sorted = _.sortBy(cardsWithPosition, 'position');
    var beatIds = _.pluck(sorted, 'beat_id');
    this.setState({beatIdsForLine: beatIds});
  },

  addPositionToCards: function(cards) {
    var beats = this.state.beats;
    return cards.map(function(card){
      card.position = _.find(beats, {id: card.beat_id}).position;
      return card;
    });
  },

  setCurrentLine: function(lineId) {
    this.setState({currentLineId: lineId});
    this.initBeatState(lineId);
  },

  getCurrentLine: function() {
    return _.find(this.state.lines, {id: this.state.currentLineId}) || {title: "sorry, no lines", id: 0};
  },

  getCardsForLine: function(lineId) {
    return _.filter(this.state.cards, {line_id: lineId});
  },

  getBeat: function(beatId) {
    return _.find(this.state.beats, {id: beatId});
  },

  increaseBeat: function() {
    this.findNextCardForLine(true);
  },

  decreaseBeat: function() {
    this.findNextCardForLine(false);
  },

  findNextCardForLine: function(increasing) {
    var beatIdIndex = this.state.currentBeatIdIndex;
    if(increasing){
      if(beatIdIndex < (this.state.beatIdsForLine.length - 1)) beatIdIndex++;
    }else{
      if(beatIdIndex > 0) beatIdIndex--;
    }
    this.setState({currentBeatIdIndex: beatIdIndex});
  },

  getCardForBeat: function(cards, beatId) {
    return _.find(cards, {beat_id: beatId});
  },

  goToPresentView: function(e) {
    this.transitionTo("presentSlidesView", {boardId: this.state.board.id, lineId: this.state.currentLineId});
  },

  goToFeedbackView: function(e) {
    return null;
  },

  goToExport: function(e) {
    return null;
  },

  goToPrint: function(e) {
    this.transitionTo("printSlidesView", {boardId: this.state.board.id, lineId: this.state.currentLineId});
  },

  render: function() {
    return this.state.board ? this.renderBoard() : this.renderLoading();
  },

  renderBoard: function() {
    var currentLine = this.getCurrentLine();
    var board = this.state.board;
    return (
      <div>
        <h1>{board.title} (slides)</h1>
        <div className="slide-create__button-container">
          <div className="card-dialog__line">
            <label className="card-dialog__line-label" htmlFor="line_selector">Line:
              <DropdownButton id="line_selector" className="card-dialog__select-line" title={currentLine.title}>
                {this.renderLineItems()}
              </DropdownButton>
            </label>
          </div>
          <Button onClick={this.goToPresentView}>present {currentLine.title}</Button>
          <Button onClick={this.goToPrint} value={board.id}><Icon glyph="print" /> print</Button>
        </div>
        <div className="slide-create__slide-container">
          {this.renderCardsForLine(currentLine)}
        </div>
      </div>
    );
  },

  // TODO: maybe make a feedback view
  // <Button onClick={this.goToFeedbackView} value={board.id}>feedback</Button>

  renderLoading: function() {
    return <p>Loading...</p>;
  },

  renderLineItems: function() {
    return this.state.lines.reduce(function(elts, line) {
      elts.push(
        <MenuItem
          key={line.id}
          onSelect={this.setCurrentLine.bind(this, line.id)}
          >
          {line.title}
        </MenuItem>
      );
      return elts;
    }.bind(this), []);
  },

  renderCardsForLine: function(line) {
    var beatIdIndex = this.state.currentBeatIdIndex;
    var cards = this.getCardsForLine(line.id);
    var beatIds = this.state.beatIdsForLine;
    if(!beatIds) return this.renderLoading();
    var card = this.getCardForBeat(cards, beatIds[beatIdIndex]);
    var beat = this.getBeat(beatIds[beatIdIndex]);
    if(beat && card){
      return (<div className="slide-create__slide">
        <h3>{this.renderTitle(beat)}</h3>
        <div className="slide-create__slide-contents">
          <SlideView key={card.id} card={card} />
          <SlideFeedbackView key={"feedback-" + card.id} cardId={card.id} creating={true} />
        </div>
      </div>)
    } else {
      this.renderLoading();
    }
  },

  renderTitle: function(beat) {
    return (<span>
      {this.renderBackButton()}
      {beat.title}
      {this.renderForwardButton()}
    </span>);
  },

  renderBackButton: function() {
    if(this.state.currentBeatIdIndex > 0) {
      return <Button className="pull-left" onClick={this.decreaseBeat}><Icon glyph='arrow-left' /></Button>;
    }
  },

  renderForwardButton: function() {
    if(this.state.currentBeatIdIndex != (this.state.beatIdsForLine.length - 1)) {
      return <Button className="pull-right" onClick={this.increaseBeat}><Icon glyph='arrow-right' /></Button>;
    }
  },

});

module.exports = SlideCreateView;

