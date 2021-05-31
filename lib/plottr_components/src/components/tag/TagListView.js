import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Nav, NavItem, Button } from 'react-bootstrap'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedTagView from './TagView'
import UnconnectedTagCategoriesModal from './TagCategoriesModal'

const TagListViewConnector = (connector) => {
  const SubNav = UnconnectedSubNav(connector)
  const TagView = UnconnectedTagView(connector)
  const TagCategoriesModal = UnconnectedTagCategoriesModal(connector)

  class TagListView extends Component {
    state = {
      appending: false,
      categoriesDialogOpen: false,
      tagDetailId: null,
      newCategoryId: null,
    }

    static getDerivedStateFromProps(props, state) {
      let returnVal = { ...state }
      const { tags, tagsByCategorySelector, categories } = props
      returnVal.tagDetailId = TagListView.detailID(
        tagsByCategorySelector,
        tags,
        categories,
        state.tagDetailId
      )

      return returnVal
    }

    static detailID(tagsByCategory, tags, categories, tagDetailId) {
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
          tagsByCategory[firstCategoryWithTag.id][0] &&
          tagsByCategory[firstCategoryWithTag.id][0].id
        )

      return null
    }

    appendBlankTag = (categoryId) => {
      this.setState({ appending: true, newCategoryId: categoryId })
    }

    doneCreating = () => {
      this.setState({ appending: false, newCategoryId: null })
    }

    renderEditing = (categoryId) => {
      const { appending, newCategoryId } = this.state
      if (!appending || categoryId !== newCategoryId) {
        return (
          <div
            className={cx('tag-list__new', { darkmode: this.props.ui.darkMode })}
            onClick={() => this.appendBlankTag(categoryId)}
          >
            <Glyphicon glyph="plus" />
          </div>
        )
      } else {
        return (
          <TagView
            key={`tag-category-${categoryId}`}
            new
            tag={{ title: '', categoryId }}
            doneCreating={this.doneCreating}
          />
        )
      }
    }

    renderTags() {
      let categories = [...this.props.categories]
      categories.push({ id: null, name: i18n('Uncategorized') })

      return categories.map((cat) => this.renderCategory(cat))
    }

    renderCategory(category) {
      const tagsInCategory = this.renderVisibleTag(category)
      return (
        <div
          className={cx('tag-list__category-wrapper', { darkmode: this.props.ui.darkMode })}
          key={`category-${category.id}`}
        >
          <h2>{category.name}</h2>
          {tagsInCategory}
          <div className="tag-list__tag-wrapper">{this.renderEditing(category.id)}</div>
        </div>
      )
    }

    renderVisibleTag(category) {
      const { tagsByCategorySelector } = this.props
      if (!tagsByCategorySelector[category.id]) return []

      return tagsByCategorySelector[category.id].map((tag) => {
        return <TagView key={tag.id} tag={tag} />
      })
    }

    closeDialog = () => {
      this.setState({ categoriesDialogOpen: false })
    }

    renderCategoriesModal() {
      if (!this.state.categoriesDialogOpen) return null
      return <TagCategoriesModal closeDialog={this.closeDialog} />
    }

    renderSubNav() {
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <Button bsSize="small" onClick={() => this.setState({ categoriesDialogOpen: true })}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
              </Button>
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    render() {
      const { ui } = this.props
      return (
        <div className="tag-list__container container-with-sub-nav">
          {this.renderSubNav()}
          {this.renderCategoriesModal()}
          <div className="tab-body">
            <div className="tab-body__title">
              <h1 className={cx('secondary-text', { darkmode: ui.darkMode })}>{i18n('Tags')}</h1>
            </div>
            <div className="tag-list__wrapper">
              <div className="tag-category-list">{this.renderTags()}</div>
            </div>
          </div>
        </div>
      )
    }
  }

  TagListView.propTypes = {
    tags: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    tagsByCategorySelector: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
  }

  const { redux } = connector
  const {
    pltr: {
      selectors: { sortedTagsSelector, sortedTagCategoriesSelector, tagsByCategorySelector },
      actions,
    },
  } = connector
  const TagActions = actions.tag

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          tags: sortedTagsSelector(state.present),
          ui: state.present.ui,
          categories: sortedTagCategoriesSelector(state.present),
          tagsByCategorySelector: tagsByCategorySelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(TagActions, dispatch),
        }
      }
    )(TagListView)
  }

  throw new Error('Could not connect TagListView')
}

export default TagListViewConnector
