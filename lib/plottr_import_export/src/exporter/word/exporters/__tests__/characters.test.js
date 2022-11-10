import { emptyFile } from 'pltr/v2'
import default_export_config from '../../../default_config'

import { goldilocks } from './fixtures'
import { characterDataExportDirectives } from '../characters'

const EMPTY_FILE = emptyFile('Test file')

describe('characterDataExportDirectives', () => {
  describe('given an empty new file', () => {
    it('should produce an empty category', () => {
      expect(characterDataExportDirectives(EMPTY_FILE, default_export_config.word)).toEqual([
        { alignment: 'center', heading: 'Heading1', type: 'paragraph', text: 'Characters' },
      ])
    })
  })
})
