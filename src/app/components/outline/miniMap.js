import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import ReactDOM from 'react-dom'
import { Nav, NavItem } from 'react-bootstrap'

class MiniMap extends Component {
  constructor (props) {
    super(props)
    this.state = {mouseOver: false}
  }

  selectNav (key, href) {
    window.location = `#${href}`
    window.scrollBy(0, -105)
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
    return scenes.map(s =>
      <NavItem ref={s.title} key={s.id} href={s.title} className='outline__minimap__scene-title'>
        <span>{s.title}</span>
        <div className='outline__minimap__dots'>{this.renderCardDots(this.props.cardMapping[s.id])}</div>
      </NavItem>
    )
  }

  render () {
    return (
      <Nav
        className='outline__minimap'
        activeHref={this.props.active}
        onSelect={this.selectNav.bind(this)}
        onMouseEnter={() => this.setState({mouseOver: true})}
        onMouseLeave={() => this.setState({mouseOver: false})}>
        {this.renderScenes()}
      </Nav>
    )
  }

  componentDidUpdate () {
    if (!this.state.mouseOver) {
      var domNode = ReactDOM.findDOMNode(this.refs[this.props.active])
      if (domNode) {
        domNode.scrollIntoViewIfNeeded()
      }
    }
  }
}

MiniMap.propTypes = {
  scenes: PropTypes.array.isRequired,
  active: PropTypes.string.isRequired,
  lines: PropTypes.array.isRequired,
  cardMapping: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    lines: state.lines
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MiniMap)
