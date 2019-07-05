import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as LineActions from 'actions/lines'
import LineView from 'components/timeline/lineView'
import orientedClassName from 'helpers/orientedClassName'

class LineListView extends Component {

  labelMap () {
    var mapping = {}
    this.props.tags.forEach((t) => {
      mapping[t.title.toLowerCase()] = {color: t.color, id: t.id, type: 'Tag'}
    })
    this.props.characters.forEach((c) => {
      mapping[c.name.toLowerCase()] = {color: c.color, id: c.id, type: 'Character'}
    })
    this.props.places.forEach((p) => {
      mapping[p.name.toLowerCase()] = {color: p.color, id: p.id, type: 'Place'}
    })
    return mapping
  }

  handleCreateNewLine = () => {
    this.props.actions.addLine()
  }

  handleReorder = (originalLinePosition, droppedLinePosition) => {
    const lines = _.sortBy(this.props.lines, 'position')
    const [removed] = lines.splice(droppedLinePosition, 1)
    lines.splice(originalLinePosition, 0, removed)
    this.props.actions.reorderLines(lines)
  }

  render () {
    const lineViews = this.renderLines()
    return lineViews
  }

  //
  // render () {
  //   var lineViews = this.renderLines()
  //   return (<div className={orientedClassName('line-list', this.props.orientation)}>
  //     {lineViews}
  //     <div className={orientedClassName('line-list__new', this.props.orientation)} onClick={this.handleCreateNewLine} >
  //       <Glyphicon glyph='plus' />
  //     </div>
  //   </div>)
  // }

  renderLines () {
    const lines = _.sortBy(this.props.lines, 'position')
    return lines.map((line) => {
      return (
        <LineView key={'lineId-' + line.id}
          line={line}
          sceneMap={this.props.sceneMap}
          labelMap={this.labelMap()}
          handleReorder={this.handleReorder}
          filteredItems={this.props.filteredItems}
          isZoomed={this.props.isZoomed}
        />
      )
    })
  }
}

LineListView.propTypes = {
  lines: PropTypes.array.isRequired,
  sceneMap: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  filteredItems: PropTypes.object,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  isZoomed: PropTypes.bool.isRequired,
  orientation: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    places: state.places,
    characters: state.characters,
    tags: state.tags,
    orientation: state.ui.orientation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(LineActions, dispatch)
  }
}

const Pure = PureComponent(LineListView)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)
