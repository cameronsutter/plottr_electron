var EventEmitter = require('events').EventEmitter;
var mergeInto = require('react/lib/mergeInto');

function createStore(initialState) {
  var events = new EventEmitter();
  var state = initialState || {};
  var loadState = "not loaded";

  return {

    setState: function(newState) {
      mergeInto(state, newState);
      this.stateChanged();
    },

    replaceState: function(newState) {
      state = newState;
      this.stateChanged();
    },

    stateChanged: function() {
      loadState = "loaded";
      this.emitChange();
    },

    getState: function() {
      return state;
    },

    addChangeListener: function (listener) {
      events.on('change', listener);
    },

    removeChangeListener: function (listener) {
      events.removeListener('change', listener);
    },

    emitChange: function() {
      events.emit('change');
    },

    isLoaded: function() {
      return loadState === "loaded";
    },

    subscribe: function(listener) {
      this.addChangeListener(listener);
      if (loadState === "loaded" ) {
        listener();
      }
      else {
        this.fetch();
      }
    },

    fetch: function() {
      if (!this.load) {
        console.warn("WARNING: load function not provided to store");
        return;
      }

      if (loadState !== "loading") {
        loadState = "loading";
        this.load();
      }
      // else, it's currently loading, do nothing
    }

  };
};

module.exports = createStore;