import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button } from 'react-bootstrap'
import * as TagActions from 'actions/tags'
import TagView from 'components/tag/tagView'
import cx from 'classnames'
import i18n from 'format-message'

class TagListView extends Component {

  handleCreateNewTag = () => {
    this.props.actions.addTag()
  }

  renderTags () {
    const sortedTags = _.sortBy(this.props.tags, ['title', 'id'])
    return sortedTags.map(t => <TagView key={t.id} tag={t} />)
  }

  renderSubNav () {
    const { ui } = this.props
    return (
      <Navbar className={cx('subnav__container', {darkmode: ui.darkMode})}>
        <Nav bsStyle='pills'>
          <NavItem>
            <Button bsSize='small' onClick={this.handleCreateNewTag}><Glyphicon glyph='plus' /> {i18n('New')}</Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  render () {
    const { ui } = this.props
    return (
      <div className='tag-list__container container-with-sub-nav'>
        { this.renderSubNav() }
        <h1 className={cx('secondary-text', {darkmode: ui.darkMode})}>{i18n('Tags')}</h1>
        <div className='tag-list__tags'>
          {this.renderTags()}
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

function mapStateToProps (state) {
  return {
    tags: state.tags,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(TagActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TagListView)
