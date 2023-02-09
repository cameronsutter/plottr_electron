import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FaCaretDown, FaCaretRight } from 'react-icons/fa'
import { FiHelpCircle } from 'react-icons/fi'

import { t } from 'plottr_locales'

import Form from '../Form'
import Modal from '../Modal'
import ButtonToolbar from '../ButtonToolbar'
import Row from '../Row'
import Col from '../Col'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import getTestIds from '../getTestIds'
import Button from '../Button'
import ToolTip from '../ToolTip'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

export const testIds = getTestIds()

const TemplateCreateConnector = (connector) => {
  const TemplateCreate = ({
    type,
    close,
    darkMode,
    saveTemplate,
    advancedSaveExpanded,
    toggleAdvancedSaveTemplatePanel,
  }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [link, setLink] = useState('')
    const [bias, setBias] = useState('top')

    const saveEdit = () => {
      const data = {
        name,
        description,
        link,
        ...(type === 'plotlines' ? { bias } : {}),
      }

      saveTemplate({ type, data })
      close()
    }

    const titleFor = (type) => {
      switch (type) {
        case 'plotlines':
          return t('My Timeline Template')
        case 'characters':
          return t('My Character Template')
        case 'scenes':
          return t('My Scene Template')
      }
      // This was the old default at the time of refactoring
      return t('My Character Template')
    }

    const renderToolBar = () => {
      return (
        <ButtonToolbar>
          <Button data-testid={testIds.save} bsStyle="success" onClick={saveEdit}>
            {t('Save')}
          </Button>
          <Button data-testid={testIds.cancel} onClick={close}>
            {t('Cancel')}
          </Button>
        </ButtonToolbar>
      )
    }

    const renderBody = () => {
      return (
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {t('Name')}
            </Col>
            <Col sm={8}>
              <FormControl
                data-testid={testIds.name}
                type="text"
                value={name}
                placeholder={t('Custom Template')}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {t('Description')}
            </Col>
            <Col sm={8}>
              <FormControl
                data-testid={testIds.description}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {t('Source Link')}
            </Col>
            <Col sm={8}>
              <FormControl
                data-testid={testIds.link}
                type="text"
                value={link}
                onChange={(e) => setLink(e.currentTarget.value)}
                placeholder="https://example.com/"
              />
            </Col>
          </FormGroup>
          {type === 'plotlines' ? (
            <>
              <FormGroup>
                <Col componentClass={ControlLabel} sm={3} className="template-create__expand-label">
                  {t('Advanced')}{' '}
                  {advancedSaveExpanded ? (
                    <FaCaretDown
                      onClick={toggleAdvancedSaveTemplatePanel}
                      className="template-create__expand-caret"
                    />
                  ) : (
                    <FaCaretRight
                      onClick={toggleAdvancedSaveTemplatePanel}
                      className="template-create__expand-caret"
                    />
                  )}
                </Col>
              </FormGroup>
              {advancedSaveExpanded ? (
                <FormGroup>
                  <Row>
                    <Col componentClass={ControlLabel} sm={3}>
                      {t('Placement')}
                    </Col>
                    <Col sm={8}>
                      <FormControl
                        componentClass="select"
                        placeholder="Act"
                        onSelect={withEventTargetValue(setBias)}
                        defaultValue={bias}
                      >
                        <option value="top">{t('Act')}</option>
                        <option value="middle">{t('Chapter')}</option>
                        <option value="bottom">{t('Scene')}</option>
                      </FormControl>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>&nbsp;</Col>
                    <Col sm={8}>
                      <label className="template-create__bias-label">
                        {t(
                          'Please indicate where the headings of your template should be placed within the act structure. When this template is used, your headings will default to being placed here.'
                        )}{' '}
                        <ToolTip
                          id="bias-tooltip"
                          text={t(
                            "Plottr uses this if the template's act structure is different from the timeline where it is used."
                          )}
                        >
                          <FiHelpCircle />
                        </ToolTip>
                      </label>
                    </Col>
                  </Row>
                </FormGroup>
              ) : null}
            </>
          ) : null}
        </Form>
      )
    }

    const title = titleFor(type)

    return (
      <Modal
        animation={false}
        show={true}
        onHide={close}
        dialogClassName={cx('book-dialog', { darkmode: darkMode })}
      >
        <Modal.Header closeButton>
          <Modal.Title data-testid={testIds.title}>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderBody()}</Modal.Body>
        <Modal.Footer>{renderToolBar()}</Modal.Footer>
      </Modal>
    )
  }

  TemplateCreate.propTypes = {
    close: PropTypes.func.isRequired,
    advancedSaveExpanded: PropTypes.bool.isRequired,
    saveTemplate: PropTypes.func.isRequired,
    type: PropTypes.string,
    darkMode: PropTypes.bool,
    toggleAdvancedSaveTemplatePanel: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          darkMode: selectors.isDarkModeSelector(state.present),
          advancedSaveExpanded: selectors.templateModalAdvancedPanelOpenSelector(state.present),
          saveTemplate: connector.platform.template.saveTemplate,
        }
      },
      {
        toggleAdvancedSaveTemplatePanel: actions.ui.toggleAdvancedSaveTemplatePanel,
      }
    )(TemplateCreate)
  }

  throw new Error('Cannot connect TemplateCreate.js')
}

export default TemplateCreateConnector
