const { remote } = require('electron')
const app = remote.app
const path = require('path')
const { setupI18n } = require('../locales');
const SETTINGS = require('./settings');
const { getTrialModeStatus } = require('./main_modules/trial_manager');

require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
const trialMode = getTrialModeStatus();
var versionString = i18n('Version') + ' '
if (trialMode) versionString = i18n('TRIAL Version') + ' '

setupI18n(SETTINGS);

var p = document.getElementById('versionP')
var versionNode = document.createTextNode(versionString + app.getVersion())
p.appendChild(versionNode)

var h4contact = document.getElementById('contactH4')
var contactNode = document.createTextNode(i18n('Contact'))
h4contact.appendChild(contactNode)

var h4credits = document.getElementById('creditsH4')
var creditsNode = document.createTextNode(i18n('Credits'))
h4credits.appendChild(creditsNode)

var span = document.getElementById('craftedSpan')
var craftedNode = document.createTextNode(i18n('Crafted in the Mountains of Utah'))
span.appendChild(craftedNode)

document.title = i18n('About Plottr')
