/** @jsx React.DOM */

var $ = require('jquery')
var React = require('react');

// To help react-modal find react
window.React = React;

var Modal = require('react-modal/dist/react-modal');
var routes = require('routes')

var appElt = $('.contents')[0]


Modal.setAppElement(appElt);
Modal.injectCSS();

React.renderComponent(routes, appElt);
