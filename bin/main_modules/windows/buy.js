const { shell } = require('electron');

function openBuyWindow () {
  shell.openExternal("https://plottr.com/pricing/")
}

module.exports = { openBuyWindow };
