import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

export const allTagsSelector = (state) => state.tags

export const sortedTagsSelector = createSelector(allTagsSelector, (tags) =>
  sortBy(tags, ['title', 'id'])
)
