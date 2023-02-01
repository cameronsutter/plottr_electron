import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Row, Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import InputModal from '../dialogs/InputModal'
import UnconnectedTemplatePicker from '../templates/TemplatePicker'

import { checkDependencies } from '../checkDependencies'

const AddLineRowConnector = (connector) => {
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  const templatesDisabled = connector.platform.templatesDisabled
  checkDependencies({ templatesDisabled })

  const AddLineRow = ({
    actions,
    templateActions,
    currentTimeline,
    isSmall,
    isMedium,
    howManyCells,
    zIndex,
  }) => {
    const [hovering, setHovering] = useState(false)
    const [showTemplatePicker, setShowTemplatePicker] = useState(false)
    const [askingForInput, setAskingForInput] = useState(false)

    const handleChooseTemplate = (template, selectedIndex) => {
      templateActions.applyTimelineTemplate(currentTimeline, template, selectedIndex)
      setShowTemplatePicker(false)
    }

    const simpleAddLine = (title) => {
      actions.addLineWithTitle(title, currentTimeline)
      setAskingForInput(false)
      setHovering(false)
    }

    const renderInputModal = () => {
      if (!askingForInput) return null

      return (
        <InputModal
          isOpen={true}
          getValue={simpleAddLine}
          title={t('Plotline Title:')}
          type="text"
          cancel={() => {
            setAskingForInput(false)
            setHovering(false)
          }}
        />
      )
    }

    const renderInsertButton = () => {
      if (isSmall) {
        return (
          <th className="row-header">
            {renderInputModal()}
            <div className="line-list__append-line" onClick={() => setAskingForInput(true)}>
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
          {hovering ? (
            <div className="line-list__append-line__double">
              <div
                onClick={() => {
                  setShowTemplatePicker(true)
                  setHovering(false)
                }}
                className={cx('template', { disabled: templatesDisabled })}
              >
                {isMedium ? t('Templates') : t('Use Template')}
              </div>
              <div onClick={() => actions.addLine(currentTimeline)} className="non-template">
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

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          types={['plotlines']}
          modal={true}
          isOpen={showTemplatePicker}
          close={() => setShowTemplatePicker(false)}
          onChooseTemplate={handleChooseTemplate}
        />
      )
    }

    if (isSmall) {
      const tds = [<td key={howManyCells + 1} />]
      for (let i = 0; i < howManyCells; i++) {
        tds.push(<td key={i} />)
      }
      return (
        <tr>
          {renderInsertButton()}
          {tds}
        </tr>
      )
    } else {
      return (
        <Row style={{ zIndex, position: zIndex ? 'relative' : null }}>
          <Cell onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            {renderInsertButton()}
            {renderTemplatePicker()}
          </Cell>
        </Row>
      )
    }
  }

  AddLineRow.propTypes = {
    howManyCells: PropTypes.number,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    beats: PropTypes.array,
    lines: PropTypes.array,
    cards: PropTypes.array,
    actions: PropTypes.object,
    templateActions: PropTypes.object,
    zIndex: PropTypes.number,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          currentTimeline: selectors.currentTimelineSelector(state.present),
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
          templateActions: bindActionCreators(actions.templates, dispatch),
        }
      }
    )(AddLineRow)
  }

  throw new Error('Could not connect AddLineRow')
}

export default AddLineRowConnector
