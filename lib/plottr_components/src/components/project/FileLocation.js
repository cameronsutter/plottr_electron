import React from 'react'
import PropTypes from 'react-proptypes'
import { NavItem, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'

import { checkDependencies } from '../checkDependencies'

const FileLocationConnector = (connector) => {
  const {
    platform: { tempFilesPath, moveFromTemp, showItemInFolder, isMacOS, os },
  } = connector
  checkDependencies({ tempFilesPath, moveFromTemp, showItemInFolder, isMacOS, os })

  const FileLocation = ({ file, state, hasCurrentProLicense }) => {
    let showInMessage = t('Show in File Explorer')
    if (isMacOS()) {
      showInMessage = t('Show in Finder')
    }

    const osIsUnknown = os() === 'unknown'

    const chooseLocation = moveFromTemp

    if (osIsUnknown) return null
    if (hasCurrentProLicense) return null

    let button = (
      <Button bsSize="small" onClick={() => showItemInFolder(file.fileName)}>
        {showInMessage}
      </Button>
    )
    if (file.fileName?.includes(tempFilesPath)) {
      button = (
        <Button
          bsSize="small"
          onClick={() => {
            chooseLocation(state)
          }}
          title={t('Choose where to save this file on your computer')}
        >
          {t('Save File')}
        </Button>
      )
    }

    return <NavItem>{button}</NavItem>
  }

  FileLocation.propTypes = {
    file: PropTypes.object.isRequired,
    state: PropTypes.object.isRequired,
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        file: state.present.file,
        state: state.present,
        hasCurrentProLicense: selectors.hasProSelector(state.present),
      }
    })(FileLocation)
  }

  throw new Error('Could not connect FileLocation')
}

export default FileLocationConnector
