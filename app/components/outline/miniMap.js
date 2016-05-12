import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import ReactDOM from 'react-dom'
import { Nav, NavItem } from 'react-bootstrap'

class MiniMap extends Component {
  selectNav (key, href) {
    window.location = `#${href}`
    window.scrollBy(0, -55)
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map(s =>
      <NavItem ref={s.title} key={s.id} href={s.title} className='outline__minimap__scene-title'>
        {s.title}
      </NavItem>
    )
  }

  render () {
    return (
      <Nav activeHref={this.props.active} onSelect={this.selectNav.bind(this)} className='outline__minimap'>
        {this.renderScenes()}
      </Nav>
    )
  }

  componentDidUpdate () {
    var domNode = ReactDOM.findDOMNode(this.refs[this.props.active])
    if (domNode) {
      domNode.scrollIntoViewIfNeeded()
    }
  }
}

MiniMap.propTypes = {
  scenes: PropTypes.array.isRequired,
  active: PropTypes.string.isRequired
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
)(MiniMap)
