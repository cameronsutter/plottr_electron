import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import SceneListView from 'components/timeline/sceneListView'
import LineListView from 'components/timeline/lineListView'

class TimeLineView extends Component {
  constructor (props) {
    super(props)
    this.state = {filteredItems: this.defaultFilteredItemsObj()}
  }

  defaultFilteredItemsObj () {
    return {tag: [], character: [], place: []}
  }

  filterItem (type, id) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[type].indexOf(id) === -1) {
      filteredItems[type].push(id)
    } else {
      var index = filteredItems[type].indexOf(id)
      if (index !== -1) filteredItems[type].splice(index, 1)
    }
    this.setState({filteredItems: filteredItems})
  }

  filterList (type, list) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[type].length > 0) {
      filteredItems[type] = []
    } else {
      filteredItems[type] = list.map((item) => item.id)
    }
    this.setState({filteredItems: filteredItems})
  }

  render () {
    return (
      <div id='timelineview-root'>
        <SceneListView filterItem={this.filterItem.bind(this)} filterList={this.filterList.bind(this)} filteredItems={this.state.filteredItems} />
        <LineListView sceneMap={this.sceneMapping()} filteredItems={this.state.filteredItems} />
      </div>
    )
  }

  sceneMapping () {
    var mapping = {}
    this.props.scenes.forEach((s) => {
      mapping[s.position] = s.id
    })
    return mapping
  }
}

TimeLineView.propTypes = {
  scenes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeLineView)
