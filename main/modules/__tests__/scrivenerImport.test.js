import { createFromScrivener } from '../files'

function isAnObject(val) {
  if (val && val instanceof Object) {
    return true
  } else {
    return false
  }
}

describe('createFromScrivener', async () => {
  const aCoronersTale = `${__dirname}/__fixtures__/example_scrivener_files/A Coroners Tale Temp2.scriv`
  const fracturedTest = `${__dirname}/__fixtures__/example_scrivener_files/Fractured Test Import to Plottr.scriv`
  const theTurn = `${__dirname}/__fixtures__/example_scrivener_files/The Turn.scriv`

  const scrivenerFiles = [aCoronersTale, fracturedTest, theTurn]
  scrivenerFiles.forEach((file, idx) => {
    it('should produce a json object representing a plottr file', async () => {
      console.log('file', idx, file)
      expect(file).toBeDefined()
      expect(await createFromScrivener(file)).toBeDefined()
    })
  })
})
