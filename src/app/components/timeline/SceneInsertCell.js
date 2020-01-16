import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'

export default class SceneInsertCell extends Component {
  render () {
    const { scenePosition, lineId, isInSceneList, handleInsert } = this.props
    return <Cell>
      <div
        className={isInSceneList ? 'scene-list__insert' : 'line-list__insert-scene'}
        onClick={() => handleInsert(scenePosition, lineId)}
      >
        <div className='insert-scene-wrapper'>
          <Glyphicon glyph='plus' />
        </div>
      </div>
    </Cell>
  }

  static propTypes = {
    handleInsert: PropTypes.func.isRequired,
    isInSceneList: PropTypes.bool.isRequired,
    scenePosition: PropTypes.number.isRequired,
    lineId: PropTypes.number,
  }
}
