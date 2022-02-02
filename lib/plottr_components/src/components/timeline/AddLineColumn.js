import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import InputModal from '../dialogs/InputModal'
import UnconnectedTemplatePicker from '../templates/TemplatePicker'

import { checkDependencies } from '../checkDependencies'

const {
  orientedClassName: { orientedClassName },
} = helpers

const AddLineColumnConnector = (connector) => {
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  const templatesDisabled = connector.platform.templatesDisabled
  checkDependencies({ templatesDisabled })

  const AddLineColumn = ({ actions, currentTimeline, hierarchyEnabled, isSmall, isMedium }) => {
    const [hovering, setHovering] = useState(false)
    const [showTemplatePicker, setShowTemplatePicker] = useState(false)
    const [askingForInput, setAskingForInput] = useState(false)

    const handleChooseTemplate = (template) => {
      actions.addLinesFromTemplate(template)
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

      const appendKlass = cx(orientedClassName('line-list__append-line', 'vertical'), {
        'medium-timeline': isMedium,
      })
      return hovering ? (
        <div className={appendKlass}>
          <div
            className={cx(orientedClassName('line-list__append-line-wrapper', 'vertical'), {
              'medium-timeline': isMedium,
            })}
          >
            <div className={orientedClassName('line-list__append-line__double', 'vertical')}>
              <div
                onClick={() => {
                  if (hierarchyEnabled) return
                  setShowTemplatePicker(true)
                  setHovering(false)
                }}
                title={hierarchyEnabled ? 'Templates are disabled when Act Structure is on' : null}
                className={cx('template', { disabled: hierarchyEnabled || templatesDisabled })}
              >
                {isMedium ? t('Templates') : t('Use Template')}
              </div>
              <div onClick={() => actions.addLine(currentTimeline)} className="non-template">
                <Glyphicon glyph="plus" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={appendKlass}>
          <div
            className={cx(orientedClassName('line-list__append-line-wrapper', 'vertical'), {
              'medium-timeline': isMedium,
            })}
          >
            <Glyphicon glyph="plus" />
          </div>
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
      return renderInsertButton()
    } else {
      return (
        <Cell onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
          {renderInsertButton()}
          {renderTemplatePicker()}
        </Cell>
      )
    }
  }

  AddLineColumn.propTypes = {
    actions: PropTypes.object.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hierarchyEnabled: PropTypes.bool.isRequired,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => ({
        currentTimeline: selectors.currentTimelineSelector(state.present),
        hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
        isSmall: selectors.isSmallSelector(state.present),
        isMedium: selectors.isMediumSelector(state.present),
      }),
      (dispatch) => ({
        actions: bindActionCreators(actions.line, dispatch),
      })
    )(AddLineColumn)
  }

  throw new Error('Could not connect AddLineColumn')
}

export default AddLineColumnConnector