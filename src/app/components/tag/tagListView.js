import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, NavItem, Button } from 'react-bootstrap'
import TagView from 'components/tag/tagView'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import { actions, selectors, initialState } from 'pltr/v2'
import { SubNav } from 'connected-components'

const { sortedTagsSelector } = selectors
const { tag } = initialState

const TagActions = actions.tag

class TagListView extends Component {
  state = {
    appending: false,
  }

  appendBlankTag = () => {
    this.setState({ appending: true })
  }

  doneCreating = () => {
    this.setState({ appending: false })
  }

  renderTags() {
    let renderedTags = this.props.tags.map((t) => <TagView key={t.id} tag={t} />)
    if (this.state.appending) {
      renderedTags.push(<TagView key="appended" new tag={tag} doneCreating={this.doneCreating} />)
    }
    return renderedTags
  }

  renderSubNav() {
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <NavItem>
            <Button bsSize="small" onClick={this.appendBlankTag}>
              <Glyphicon glyph="plus" /> {i18n('New')}
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
        <div className="tab-body">
          <h1 className={cx('secondary-text', { darkmode: ui.darkMode })}>{i18n('Tags')}</h1>
          <div className="tag-list__wrapper">
            <div className="tag-list__tags">
              {this.renderTags()}
              <div className="tag-list__tag-wrapper">
                {!this.state.appending ? (
                  <div
                    className={cx('tag-list__new', { darkmode: ui.darkMode })}
                    onClick={this.appendBlankTag}
                  >
                    <Glyphicon glyph="plus" />
                  </div>
                ) : null}
              </div>
            </div>
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
}

function mapStateToProps(state) {
  return {
    tags: sortedTagsSelector(state.present),
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(TagActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TagListView)
