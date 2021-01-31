import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { keyBy } from 'lodash'
import { findDOMNode } from 'react-dom'
import { Nav, NavItem } from 'react-bootstrap'
import cx from 'classnames'
import * as CardActions from 'actions/cards'
import { sortedChaptersByBookSelector, positionOffsetSelector } from '../../selectors/chapters'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { isSeriesSelector } from '../../selectors/ui'
import MiniChapter from './MiniChapter'

const targetPosition = 115

class MiniMap extends Component {
  constructor(props) {
    super(props)
    this.state = { mouseOver: false, firstRender: true }
    this.firstChapterKey = props.chapters.length ? props.chapters[0].id : 0 // this works since they are sorted
  }

  componentDidMount() {
    setTimeout(() => this.setState({ firstRender: false }), 300)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
      this.setState({ firstRender: true })
      setTimeout(() => this.setState({ firstRender: false }), 500)
    }
  }

  selectNav = (key) => {
    const elem = document.querySelector(`#chapter-${key}`)
    elem.scrollIntoViewIfNeeded()
    if (key != this.firstChapterKey) {
      const container = document.querySelector('.outline__container')
      const yPosition = elem.getBoundingClientRect().y
      container.scrollBy(0, yPosition - targetPosition)
    }
  }

  renderChapters() {
    const {
      lines,
      chapters,
      activeFilter,
      isSeries,
      cardMapping,
      positionOffset,
      actions,
    } = this.props
    const linesById = keyBy(lines, 'id')
    return chapters.map((ch, idx) => {
      if (this.state.firstRender && idx > 20) return null
      const chapterCards = cardMapping[ch.id]
      if (activeFilter && !chapterCards.length) return null

      return (
        <NavItem ref={`chapter-${ch.id}`} key={`minimap-chapter-${ch.id}`} eventKey={ch.id}>
          <MiniChapter
            chapter={ch}
            idx={idx + positionOffset}
            cards={chapterCards}
            linesById={linesById}
            isSeries={isSeries}
            sortedLines={lines}
            positionOffset={positionOffset}
            reorderCardsWithinLine={actions.reorderCardsWithinLine}
            reorderCardsInChapter={actions.reorderCardsInChapter}
          />
        </NavItem>
      )
    })
  }

  render() {
    return (
      <Nav
        className={cx('outline__minimap', { darkmode: this.props.ui.darkMode })}
        activeKey={this.props.active}
        onSelect={this.selectNav}
        onMouseEnter={() => this.setState({ mouseOver: true })}
        onMouseLeave={() => this.setState({ mouseOver: false })}
      >
        {this.renderChapters()}
      </Nav>
    )
  }

  componentDidUpdate() {
    if (!this.state.mouseOver) {
      const chapter = this.props.chapters.find((ch) => ch.id === this.props.active)
      let title = ''
      if (chapter) title = `chapter-${chapter.id}`
      var domNode = findDOMNode(this.refs[title])
      if (domNode) {
        domNode.scrollIntoViewIfNeeded()
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.mouseOver != this.state.mouseOver) return false
    return true
  }
}

MiniMap.propTypes = {
  active: PropTypes.number.isRequired,
  cardMapping: PropTypes.object.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  chapters: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool.isRequired,
  positionOffset: PropTypes.number.isRequired,
}

function mapStateToProps(state) {
  return {
    chapters: sortedChaptersByBookSelector(state.present),
    lines: sortedLinesByBookSelector(state.present),
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
    positionOffset: positionOffsetSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MiniMap)
