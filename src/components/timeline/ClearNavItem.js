import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import { NavItem, Button, Glyphicon } from 'react-bootstrap'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'

const ClearNavItemConnector = (connector) => {
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

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  const { currentTimelineSelector } = selectors
  const UIActions = actions.ui

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          bookId: currentTimelineSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(UIActions, dispatch),
        }
      }
    )(ClearNavItem)
  }

  throw new Error('Coudl not connect ClearNavItem')
}

export default ClearNavItemConnector
