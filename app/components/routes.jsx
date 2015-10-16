/** @jsx React.DOM */

var React = require('react');

var Router = require("react-router");
var Routes = Router.Routes;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var Plottr = require('components/plottr');
var BoardView = require('components/boardView');
var BoardEditor = require('components/boardEditor');
var CardDialog = require('components/cardDialog');

var SlideCreateView = require('components/slides/slideCreateView');
var PresentSlidesView = require('components/slides/presentSlidesView');
var PrintSlidesView = require('components/slides/printSlidesView');
var NoteViewerView = require('components/notes/NoteViewerView');

module.exports = (
  <Routes location="history">
    <Route name="root" path={window.location.pathname} handler={Plottr}>
      <DefaultRoute name="boardView" handler={BoardView} />
      <Route name="boardEditor" handler={BoardEditor} path="edit" />
      <Route name="slideCreateView" handler={SlideCreateView} path="slides" />
      <Route name="presentSlidesView" handler={PresentSlidesView} path="slides/present/:lineId" />
      <Route name="printSlidesView" handler={PrintSlidesView} path="slides/print/:lineId" />
      <Route name="noteView" handler={NoteViewerView} path="notes" />
    </Route>
  </Routes>
);
