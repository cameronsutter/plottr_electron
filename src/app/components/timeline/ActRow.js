import React, { Component } from 'react'
import { Row, Cell } from 'react-sticky-table'

export default class ActRow extends Component {
  render () {
    // first cell is a placeholder for the empty space
    // also need a cell in between each chapter

    // we need a different approach depending on if there's an even or odd number of chapters
    return <Row>
      <Cell></Cell>

      <Cell></Cell>
      <Cell></Cell>

      <Cell></Cell>
      <Cell></Cell>

      <Cell></Cell>
      <Cell>
        <div className='act-row__title-cell'>
          <div>
            <div></div>
            <div>Act 1</div>
            <div></div>
          </div>
        </div>
      </Cell>

      <Cell></Cell>
      <Cell></Cell>
    </Row>
  }
}

// border: 1px solid gray;
// position: absolute;
// top: 15px;
// width: 100px;
// left: -100px;