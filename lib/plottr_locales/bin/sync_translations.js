const fs = require('fs')

const enTranslationsExtracted = fs.statSync('./src/en-extracted.json')
  ? JSON.parse(fs.readFileSync('./src/en-extracted.json'))
  : []
const enTranslations = JSON.parse(fs.readFileSync('./src/en.json'))
const frTranslations = JSON.parse(fs.readFileSync('./src/fr.json'))
const esTranslations = JSON.parse(fs.readFileSync('./src/es.json'))

const enKeysExtracted = new Set(Object.keys(enTranslationsExtracted))
const enKeys = new Set(Object.keys(enTranslations))
const frKeys = new Set(Object.keys(frTranslations))
const esKeys = new Set(Object.keys(esTranslations))

const all_keys = new Set(
  Object.keys(enTranslationsExtracted)
    .concat(Object.keys(enTranslations))
    .concat(Object.keys(frTranslations))
    .concat(Object.keys(esTranslations))
)

const newEnTranslations = Object.assign({}, enTranslations)
const newFrTranslations = Object.assign({}, frTranslations)
const newEsTranslations = Object.assign({}, esTranslations)

all_keys.forEach((key) => {
  if (!enKeys.has(key)) {
    newEnTranslations[key] = {
      message: key,
    }
  }
  if (!frKeys.has(key)) {
    newFrTranslations[key] = {
      message: key,
    }
  }
  if (!esKeys.has(key)) {
    newEsTranslations[key] = {
      message: key,
    }
  }
})

fs.writeFileSync('./src/fr.json', JSON.stringify(newFrTranslations, null, 2))
fs.writeFileSync('./src/es.json', JSON.stringify(newEsTranslations, null, 2))
fs.writeFileSync('./src/en.json', JSON.stringify(newEnTranslations, null, 2))
