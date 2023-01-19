import { configureStore } from './fixtures/testStore'
import { post_multi_hierarchy_zelda } from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { loadFile } from '../../actions/ui'
import { removeSystemKeys } from '../systemReducers'

import { setHierarchyLevels, editHierarchyLevel } from '../../actions/hierarchy'

describe('setHierarchyLevels', () => {
  describe('given a file with hierarchy levels for all books', () => {
    it('should only overwrite the levels for the current book', () => {
      
    })
  })
})
