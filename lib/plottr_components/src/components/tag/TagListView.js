import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Nav, NavItem } from 'react-bootstrap'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'

import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedTagView from './TagView'
import UnconnectedTagCategoriesModal from './TagCategoriesModal'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const detailID = (tagsByCategory, tags, categories, tagDetailId) => {
  if (!tags.length) return null
  if (!Object.keys(tagsByCategory).length) return null
  const allCategories = [...categories, { id: null }] // uncategorized

  // check for the currently active one
  if (tagDetailId != null) {
    const isVisible = allCategories.some((cat) => {
      if (!tagsByCategory[cat.id] || !tagsByCategory[cat.id].length) return false
      return tagsByCategory[cat.id].some((tag) => tag.id == tagDetailId)
    })
    if (isVisible) return tagDetailId
  }

  // default to first one in the first category
  const firstCategoryWithTag = allCategories.find(
    (cat) => tagsByCategory[cat.id] && tagsByCategory[cat.id].length
  )
  if (firstCategoryWithTag)
    return (
      tagsByCategory[firstCategoryWithTag.id][0] && tagsByCategory[firstCategoryWithTag.id][0].id
    )

  return null
}

const TagListViewConnector = (connector) => {
  const SubNav = UnconnectedSubNav(connector)
  const TagView = UnconnectedTagView(connector)
  const TagCategoriesModal = UnconnectedTagCategoriesModal(connector)

  const TagListView = ({
    tags,
    actions,
    darkMode,
    tagsByCategory,
    categories,
    tagsSearchTerm,
    uiActions,
  }) => {
    const [appending, setAppending] = useState(false)
    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
    const [tagDetailId, setTagDetailId] = useState(null)
    const [newCategoryId, setNewCategoryId] = useState(null)

    useEffect(() => {
      setTagDetailId(detailID(tagsByCategory, tags, categories, tagDetailId))
    }, [tags, tagsByCategory, categories])

    const appendBlankTag = (categoryId) => {
      setAppending(true)
      setNewCategoryId(categoryId)
    }

    const doneCreating = () => {
      setAppending(false)
      setNewCategoryId(null)
    }

    const renderEditing = (categoryId) => {
      if (!appending || categoryId !== newCategoryId) {
        return (
          <div
            className={cx('tag-list__new', { darkmode: darkMode })}
            onClick={() => appendBlankTag(categoryId)}
          >
            <Glyphicon glyph="plus" />
          </div>
        )
      } else {
        return (
          <TagView
            key={`tag-category-${categoryId}`}
            newTag
            tag={{ title: '', categoryId }}
            doneCreating={doneCreating}
          />
        )
      }
    }

    const renderTags = () => {
      return [...categories, { id: null, name: i18n('Uncategorized') }].map((cat) =>
        renderCategory(cat)
      )
    }

    const renderCategory = (category) => {
      const tagsInCategory = renderVisibleTag(category)
      return (
        <div
          className={cx('tag-list__category-wrapper', { darkmode: darkMode })}
          key={`category-${category.id}`}
        >
          <h2>{i18n(category.name)}</h2>
          {tagsInCategory}
          <div className="tag-list__tag-wrapper">{renderEditing(category.id)}</div>
        </div>
      )
    }

    const renderVisibleTag = (category) => {
      if (!tagsByCategory[category.id]) return []

      return tagsByCategory[category.id].map((tag) => {
        return <TagView key={tag.id} tag={tag} />
      })
    }

    const closeDialog = () => {
      setCategoriesDialogOpen(false)
    }

    const renderCategoriesModal = () => {
      if (!categoriesDialogOpen) return null
      return <TagCategoriesModal closeDialog={closeDialog} />
    }

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        uiActions.setTagsSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const renderSubNav = () => {
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <Button bsSize="small" onClick={() => appendBlankTag(null)}>
                <Glyphicon glyph="plus" /> {i18n('New')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => setCategoriesDialogOpen(true)}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
              </Button>
            </NavItem>
            <NavItem>
              <FormControl
                onChange={withEventTargetValue(uiActions.setTagsSearchTerm)}
                onKeyUp={insertSpace}
                value={tagsSearchTerm}
                type="text"
                placeholder="Search"
                className="toolbar__search"
              />
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    return (
      <div className="tag-list__container container-with-sub-nav">
        {renderSubNav()}
        {renderCategoriesModal()}
        <div className="tab-body">
          <div className="tab-body__title">
            <h1 className={cx('secondary-text', { darkmode: darkMode })}>{i18n('Tags')}</h1>
          </div>
          <div className="tag-list__wrapper">
            <div className="tag-category-list">{renderTags()}</div>
          </div>
        </div>
      </div>
    )
  }

  TagListView.propTypes = {
    tags: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    darkMode: PropTypes.bool,
    tagsByCategory: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    tagsSearchTerm: PropTypes.string,
    uiActions: PropTypes.object.isRequired,
  }

  const { redux } = connector
  const {
    pltr: { selectors, actions },
  } = connector
  const TagActions = actions.tag
  const UiActions = actions.ui
  checkDependencies({
    redux,
    actions,
    TagActions,
    UiActions,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          tags: selectors.sortedTagsSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          categories: selectors.sortedTagCategoriesSelector(state.present),
          tagsByCategory: selectors.searchedTagsByCategorySelector(state.present),
          tagsSearchTerm: selectors.tagsSearchTermSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(TagActions, dispatch),
          uiActions: bindActionCreators(UiActions, dispatch),
        }
      }
    )(TagListView)
  }

  throw new Error('Could not connect TagListView')
}

export default TagListViewConnector
