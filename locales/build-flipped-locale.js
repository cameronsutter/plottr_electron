const fs = require('fs')
const flip = require('flip')
const en = require('./en.json')

const flipped = {}
for (const [key, value] of Object.entries(en)) {
  flipped[key] = {
    ...value,
    message: `(╯°□°）╯︵ ${flip(value.message)}`,
  }
}

fs.writeFileSync(__dirname + '/flipped.json', JSON.stringify(flipped, null, 2))
