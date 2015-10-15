/** @jsx React.DOM */

var React = require('react');

var Router = require("react-router");
var Routes = Router.Routes;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var Plottr = require('plottr');
var BoardList = require('boardList');
var BoardView = require('boardView');
var BoardEditor = require('boardEditor');
var CardDialog = require('cardDialog');

var SlideCreateView = require('slides/slideCreateView');
var PresentSlidesView = require('slides/presentSlidesView');
var PrintSlidesView = require('slides/printSlidesView');
var NoteViewerView = require('notes/NoteViewerView');

module.exports = (
  <Routes location="history">
    <Route name="root" path="/" handler={Plottr}>
      <DefaultRoute name="boardList" handler={BoardList} />
      <Route name="boardView" handler={BoardView} path="boards/:boardId" />
      <Route name="boardEditor" handler={BoardEditor} path="boards/:boardId/edit" />
      <Route name="slideCreateView" handler={SlideCreateView} path="boards/:boardId/slides" />
      <Route name="presentSlidesView" handler={PresentSlidesView} path="boards/:boardId/slides/present/:lineId" />
      <Route name="printSlidesView" handler={PrintSlidesView} path="boards/:boardId/slides/print/:lineId" />
      <Route name="noteView" handler={NoteViewerView} path="boards/:boardId/notes" />
    </Route>
  </Routes>
);
