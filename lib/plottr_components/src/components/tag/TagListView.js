import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Nav, NavItem, Button } from 'react-bootstrap'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import { initialState } from 'pltr/v2'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedTagView from './TagView'

const { tag } = initialState

const TagListViewConnector = (connector) => {
  const SubNav = UnconnectedSubNav(connector)
  const TagView = UnconnectedTagView(connector)

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

  const { redux } = connector
  const {
    pltr: {
      selectors: { sortedTagsSelector },
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
