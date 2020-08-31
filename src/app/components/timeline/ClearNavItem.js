import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import { NavItem, Button, Popover, OverlayTrigger, Glyphicon } from 'react-bootstrap'
import * as UIActions from 'actions/ui'
import { bookTimelineTemplatesSelector } from '../../selectors/books'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { currentTimelineSelector } from '../../selectors/ui'

class ClearNavItem extends Component {
  state = {deleting: false}

  clearTimeline = (e) => {
    e.stopPropagation()
    this.setState({deleting: false})
    this.props.actions.resetTimeline(this.props.bookId)
  }

  renderDelete () {
    if (!this.state.deleting) return null

    const text = i18n('Are you sure you want to clear everything in this timeline?')
    return <DeleteConfirmModal
      onDelete={this.clearTimeline}
      onCancel={() => this.setState({deleting: false})}
      customText={text}
      notSubmit
    />
  }

  render () {
    return <NavItem>
      <Button bsSize='small' onClick={() => this.setState({deleting: true})}><Glyphicon glyph='refresh'/>{' '}{i18n('Reset')}</Button>
      { this.renderDelete() }
    </NavItem>
  }
}

ClearNavItem.propTypes = {
  bookId: PropTypes.number.isRequired,
}

function mapStateToProps (state) {
  return {
    bookId: currentTimelineSelector(state.present),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClearNavItem)
