import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'
import { NavItem, Button, Glyphicon } from 'react-bootstrap'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { selectors, actions } from 'pltr/v2'

const { currentTimelineSelector } = selectors

const UIActions = actions.ui

class ClearNavItem extends Component {
  state = { deleting: false }

  clearTimeline = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false })
    this.props.actions.resetTimeline(this.props.bookId)
  }

  renderDelete() {
    if (!this.state.deleting) return null

    const text = i18n('Are you sure you want to clear everything in this timeline?')
    return (
      <DeleteConfirmModal
        onDelete={this.clearTimeline}
        onCancel={() => this.setState({ deleting: false })}
        customText={text}
        notSubmit
      />
    )
  }

  render() {
    return (
      <NavItem>
        <Button bsSize="small" onClick={() => this.setState({ deleting: true })}>
          <Glyphicon glyph="refresh" /> {i18n('Clear')}
        </Button>
        {this.renderDelete()}
      </NavItem>
    )
  }
}

ClearNavItem.propTypes = {
  bookId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  actions: PropTypes.object,
}

function mapStateToProps(state) {
  return {
    bookId: currentTimelineSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClearNavItem)
