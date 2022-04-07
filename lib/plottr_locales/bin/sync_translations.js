const fs = require('fs')

const enTranslationsExtracted = fs.statSync('./src/en-extracted.json')
  ? JSON.parse(fs.readFileSync('./src/en-extracted.json'))
  : []
const enTranslations = JSON.parse(fs.readFileSync('./src/en.json'))
const frTranslations = JSON.parse(fs.readFileSync('./src/fr.json'))
const esTranslations = JSON.parse(fs.readFileSync('./src/es.json'))
const faTranslations = JSON.parse(fs.readFileSync('./src/fa.json'))
const ruTranslations = JSON.parse(fs.readFileSync('./src/ru.json'))
const deTranslations = JSON.parse(fs.readFileSync('./src/de.json'))
const itTranslations = JSON.parse(fs.readFileSync('./src/it.json'))
const ptTranslations = JSON.parse(fs.readFileSync('./src/pt.json'))
const elTranslations = JSON.parse(fs.readFileSync('./src/el.json'))

const enKeys = new Set(Object.keys(enTranslations))
const frKeys = new Set(Object.keys(frTranslations))
const esKeys = new Set(Object.keys(esTranslations))
const faKeys = new Set(Object.keys(faTranslations))
const ruKeys = new Set(Object.keys(ruTranslations))
const deKeys = new Set(Object.keys(deTranslations))
const itKeys = new Set(Object.keys(itTranslations))
const ptKeys = new Set(Object.keys(ptTranslations))
const elKeys = new Set(Object.keys(elTranslations))

const all_keys = new Set(
  Object.keys(enTranslationsExtracted)
    .concat(Object.keys(enTranslations))
    .concat(Object.keys(frTranslations))
    .concat(Object.keys(esTranslations))
    .concat(Object.keys(faTranslations))
    .concat(Object.keys(ruTranslations))
    .concat(Object.keys(deTranslations))
    .concat(Object.keys(itTranslations))
    .concat(Object.keys(ptTranslations))
    .concat(Object.keys(elTranslations))
)

const newEnTranslations = Object.assign({}, enTranslations)
const newFrTranslations = Object.assign({}, frTranslations)
const newEsTranslations = Object.assign({}, esTranslations)
const newFaTranslations = Object.assign({}, faTranslations)
const newRuTranslations = Object.assign({}, ruTranslations)
const newDeTranslations = Object.assign({}, deTranslations)
const newItTranslations = Object.assign({}, itTranslations)
const newPtTranslations = Object.assign({}, ptTranslations)
const newElTranslations = Object.assign({}, elTranslations)

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
  if (!faKeys.has(key)) {
    newFaTranslations[key] = {
      message: key,
    }
  }
  if (!ruKeys.has(key)) {
    newRuTranslations[key] = {
      message: key,
    }
  }
  if (!deKeys.has(key)) {
    newDeTranslations[key] = {
      message: key,
    }
  }
  if (!itKeys.has(key)) {
    newItTranslations[key] = {
      message: key,
    }
  }
  if (!ptKeys.has(key)) {
    newPtTranslations[key] = {
      message: key,
    }
  }
  if (!elKeys.has(key)) {
    newElTranslations[key] = {
      message: key,
    }
  }
})

fs.writeFileSync('./src/fr.json', JSON.stringify(newFrTranslations, null, 2))
fs.writeFileSync('./src/es.json', JSON.stringify(newEsTranslations, null, 2))
fs.writeFileSync('./src/en.json', JSON.stringify(newEnTranslations, null, 2))
fs.writeFileSync('./src/fa.json', JSON.stringify(newFaTranslations, null, 2))
fs.writeFileSync('./src/ru.json', JSON.stringify(newRuTranslations, null, 2))
fs.writeFileSync('./src/de.json', JSON.stringify(newDeTranslations, null, 2))
fs.writeFileSync('./src/it.json', JSON.stringify(newItTranslations, null, 2))
fs.writeFileSync('./src/pt.json', JSON.stringify(newPtTranslations, null, 2))
fs.writeFileSync('./src/el.json', JSON.stringify(newElTranslations, null, 2))
