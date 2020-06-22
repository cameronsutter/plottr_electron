import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import { findDOMNode } from 'react-dom'
import { Nav, NavItem } from 'react-bootstrap'
import cx from 'classnames'
import { chapterTitle } from '../../helpers/chapters'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { linesByBookSelector } from '../../selectors/lines'

const targetPosition = 115

class MiniMap extends Component {
  constructor (props) {
    super(props)
    this.state = {mouseOver: false}
    this.firstChapterKey = props.chapters[0].id // this works since they are sorted
  }

  isSeries = () => {
    return this.props.ui.currentTimeline == 'series'
  }

  selectNav = (key) => {
    const elem = document.querySelector(`#chapter-${key}`)
    elem.scrollIntoViewIfNeeded()
    if (key != this.firstChapterKey) {
      const yPosition = elem.getBoundingClientRect().y
      window.scrollBy(0, yPosition - targetPosition)
    }
  }

  findCard = (linesById, card) => {
    let id = card.lineId
    if (this.isSeries()) {
      id = card.seriesLineId
    }
    return linesById[id]
  }

  renderCardDots (chapterCards) {
    const linesById = _.keyBy(this.props.lines, 'id')
    return chapterCards.map((c) => {
      let line = this.findCard(linesById, c)
      if (!line) return null

      let style = {backgroundColor: line.color}
      return <div key={`dot-${line.id}-${c.id}`} title={line.title} style={style} className='outline__minimap__card-dot'></div>
    })
  }

  renderChapters () {
    return this.props.chapters.map((ch, idx) => {
      const chapterCards = this.props.cardMapping[ch.id]
      if (this.props.activeFilter && !chapterCards.length) return null

      return <NavItem ref={chapterTitle(ch)} key={`minimap-chapter-${ch.id}`} eventKey={ch.id} className='outline__minimap__scene-title'>
        <span><span className='accented-text'>{`${idx + 1}.  `}</span><span>{chapterTitle(ch)}</span></span>
        <div className='outline__minimap__dots'>{this.renderCardDots(chapterCards)}</div>
      </NavItem>
    })
  }

  render () {
    return (
      <Nav
        className={cx('outline__minimap', {darkmode: this.props.ui.darkMode})}
        activeKey={this.props.active}
        onSelect={this.selectNav}
        onMouseEnter={() => this.setState({mouseOver: true})}
        onMouseLeave={() => this.setState({mouseOver: false})}
      >
        {this.renderChapters()}
      </Nav>
    )
  }

  componentDidUpdate () {
    if (!this.state.mouseOver) {
      const chapter = this.props.chapters.find(ch => ch.id === this.props.active)
      let title = ""
      if (chapter) title = chapter.title
      var domNode = findDOMNode(this.refs[title])
      if (domNode) {
        domNode.scrollIntoViewIfNeeded()
      }
    }
  }
}

MiniMap.propTypes = {
  chapters: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  active: PropTypes.number.isRequired,
  cardMapping: PropTypes.object.isRequired,
  activeFilter: PropTypes.bool.isRequired,
}

function mapStateToProps (state) {
  return {
    chapters: sortedChaptersByBookSelector(state),
    lines: linesByBookSelector(state),
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
