import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import InputModal from '../dialogs/InputModal'
import UnconnectedTemplatePicker from '../templates/TemplatePicker'

const AddLineRowConnector = (connector) => {
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  const templatesDisabled = connector.platform.templatesDisabled

  class AddLineRow extends Component {
    state = {
      hovering: false,
      showTemplatePicker: false,
      askingForInput: false,
    }

    handleChooseTemplate = (template) => {
      const { actions } = this.props
      actions.addLinesFromTemplate(template)
      this.setState({ showTemplatePicker: false })
    }

    simpleAddLine = (title) => {
      const { ui, actions } = this.props
      actions.addLineWithTitle(title, ui.currentTimeline)
      this.setState({ askingForInput: false, hovering: false })
    }

    renderInputModal() {
      if (!this.state.askingForInput) return null

      return (
        <InputModal
          isOpen={true}
          getValue={this.simpleAddLine}
          title={i18n('Plotline Title:')}
          type="text"
          cancel={() => this.setState({ askingForInput: false, hovering: false })}
        />
      )
    }

    renderInsertButton() {
      const { hierarchyEnabled, isSmall, isMedium, ui, actions } = this.props
      if (isSmall) {
        return (
          <th className="row-header">
            {this.renderInputModal()}
            <div
              className="line-list__append-line"
              onClick={() => this.setState({ askingForInput: true })}
            >
              <div className="line-list__append-line-wrapper">
                <Glyphicon glyph="plus" />
              </div>
            </div>
          </th>
        )
      }

      const appendKlass = cx('line-list__append-line', { 'medium-timeline': isMedium })
      return (
        <div className={appendKlass}>
          {this.state.hovering ? (
            <div className="line-list__append-line__double">
              <div
                onClick={() => {
                  if (hierarchyEnabled) return
                  this.setState({ showTemplatePicker: true, hovering: false })
                }}
                title={hierarchyEnabled ? 'Templates are disabled when Act Structure is on' : null}
                className={cx('template', { disabled: hierarchyEnabled || templatesDisabled })}
              >
                {isMedium ? i18n('Templates') : i18n('Use Template')}
              </div>
              <div onClick={() => actions.addLine(ui.currentTimeline)} className="non-template">
                <Glyphicon glyph="plus" />
              </div>
            </div>
          ) : (
            <div className="line-list__append-line-wrapper">
              <Glyphicon glyph="plus" />
            </div>
          )}
        </div>
      )
    }

    renderTemplatePicker() {
      if (!this.state.showTemplatePicker) return null

      return (
        <TemplatePicker
          type={['plotlines']}
          modal={true}
          isOpen={this.state.showTemplatePicker}
          close={() => this.setState({ showTemplatePicker: false })}
          onChooseTemplate={this.handleChooseTemplate}
        />
      )
    }

    render() {
      const { isSmall, howManyCells } = this.props
      if (isSmall) {
        const tds = [<td key={howManyCells + 1} />]
        for (let i = 0; i < howManyCells; i++) {
          tds.push(<td key={i} />)
        }
        return (
          <tr>
            {this.renderInsertButton()}
            {tds}
          </tr>
        )
      } else {
        return (
          <Row>
            <Cell
              onMouseEnter={() => this.setState({ hovering: true })}
              onMouseLeave={() => this.setState({ hovering: false })}
            >
              {this.renderInsertButton()}
              {this.renderTemplatePicker()}
            </Cell>
          </Row>
        )
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.showTemplatePicker != nextState.showTemplatePicker) return true
      if (this.state.hovering != nextState.hovering) return true
      if (this.state.askingForInput != nextState.askingForInput) return true
      return false
    }

    static propTypes = {
      hierarchyEnabled: PropTypes.bool.isRequired,
      howManyCells: PropTypes.number,
      ui: PropTypes.object.isRequired,
      isSmall: PropTypes.bool,
      isMedium: PropTypes.bool,
      bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      beats: PropTypes.array,
      lines: PropTypes.array,
      cards: PropTypes.array,
      actions: PropTypes.object,
    }
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
          ui: state.present.ui,
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          beats: selectors.sortedBeatsByBookSelector(state.present),
          lines: selectors.linesByBookSelector(state.present),
          cards: state.present.cards,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.line, dispatch),
        }
      }
    )(AddLineRow)
  }

  throw new Error('Could not connect AddLineRow')
}

export default AddLineRowConnector
