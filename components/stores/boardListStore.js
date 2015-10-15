var $ = require('jquery');
var _ = require('lodash');
var createStore = require('stores/createStore');

var BoardList = _.extend(createStore(), {
  load: function() {
    $.getJSON('/api/boards')
    .done(this.boardsLoaded.bind(this));
  },

  boardsLoaded: function(response) {
    this.setState({boards: response});
  },

  getBoard: function(id) {
    var boards = this.getState().boards;
    return _.find(boards, function(board){
      return board.id === id;
    });
  },

  saveBoard: function(board) {
    var url, method;
    if (board.id) {
      method = 'PUT';
      url = '/api/boards/' + board.id;
    }
    else {
      method = 'POST';
      url = '/api/boards';
    }

    $.ajax({
      url: url,
      type: method,
      headers: {'X-CSRF-Token': $("meta[name='csrf-token']").attr('content')},
      dataType: 'json',
      data: {board: board},
      context: this,
    }).done(this.boardSaved);
  },

  boardSaved: function(response) {
    this.fetch();
    this.replaceState({});
  },

});

module.exports = BoardList;
