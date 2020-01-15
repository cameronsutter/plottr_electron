import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import ReactDOM from 'react-dom'
import { Nav, NavItem } from 'react-bootstrap'

class MiniMap extends Component {
  constructor (props) {
    super(props)
    this.state = {mouseOver: false}
  }

  selectNav = (key) => {
    document.querySelector(`#scene-${key}`).scrollIntoViewIfNeeded()
    window.scrollBy(0, 250)
  }

  renderCardDots (sceneCards) {
    const cards = _.cloneDeep(sceneCards).reverse()
    return cards.map((c) => {
      var line = _.find(this.props.lines, {id: c.lineId})
      var style = {backgroundColor: line.color}
      return <div key={`dot-${line.id}-${c.id}`} title={line.title} style={style} className='outline__minimap__card-dot'></div>
    })
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((s, idx) =>
      <NavItem ref={s.title} key={`minimap-scene-${s.id}`} eventKey={s.id} className='outline__minimap__scene-title'>
        <span><span className='accented-text'>{`${idx + 1}.  `}</span><span>{s.title}</span></span>
        <div className='outline__minimap__dots'>{this.renderCardDots(this.props.cardMapping[s.id])}</div>
      </NavItem>
    )
  }

  render () {
    let klasses = 'outline__minimap'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <Nav
        className={klasses}
        activeKey={this.props.active}
        onSelect={this.selectNav}
        onMouseEnter={() => this.setState({mouseOver: true})}
        onMouseLeave={() => this.setState({mouseOver: false})}>
        {this.renderScenes()}
      </Nav>
    )
  }

  componentDidUpdate () {
    if (!this.state.mouseOver) {
      const scene = this.props.scenes.find(sc => sc.id === this.props.active)
      let title = ""
      if (scene) title = scene.title
      var domNode = ReactDOM.findDOMNode(this.refs[title])
      if (domNode) {
        domNode.scrollIntoViewIfNeeded()
      }
    }
  }
}

MiniMap.propTypes = {
  scenes: PropTypes.array.isRequired,
  active: PropTypes.number.isRequired,
  lines: PropTypes.array.isRequired,
  cardMapping: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    lines: state.lines,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MiniMap)
