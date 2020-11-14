const { shell } = require('electron');

function openBuyWindow () {
  shell.openExternal("https://getplottr.com/pricing/")
}

module.exports = { openBuyWindow };
