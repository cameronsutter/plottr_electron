const { ipcRenderer } = require('electron')
var i18n = require('format-message')

i18n.setup({
  translations: require('../locales'),
  locale: app.getLocale() || 'en'
})

function openBuy () {
  ipcRenderer.send('open-buy-window')
}

var h1thanks = document.getElementById('thanksH1')
var thanksNode = document.createTextNode(' ' + i18n('Thanks for trying Plottr'))
h1thanks.appendChild(thanksNode)

var h2expired = document.getElementById('expiredH2')
var expiredNode = document.createTextNode(i18n('Your free trial has expired!'))
h2expired.appendChild(expiredNode)

var aBuy = document.getElementById('buyA')
var buyNode = document.createTextNode(i18n('Click here to get the full version'))
aBuy.appendChild(buyNode)
aBuy.onclick = openBuy

var p = document.getElementById('contactMeP')
var contactNode = document.createTextNode(i18n('Or feel free to contact me with any questions'))
p.appendChild(contactNode)
