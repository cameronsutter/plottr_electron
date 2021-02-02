import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { get, set, groupBy, pickBy, keys, value } from 'lodash' // get/set will possibly be used to edit values
import { Grid, Row, Col } from 'react-bootstrap'
import ReactJson from 'react-json-view'
import Inspector from 'react-json-inspector'
import 'react-json-inspector/json-inspector.css'
import DevFileDrop from './DevFileDrop'
import { findDOMNode } from 'react-dom'
import { saveFile } from '../../../common/utils/files'
import { newIds } from 'pltr/v2'

const { nextId, objectId } = newIds

class Analyzer extends Component {
  state = { tab: 'search', path: null, tree: null }

  handleClick = ({ key, value, path }) => {
    if (path != '') {
      this.setState({ path: path, tree: value })
    }
  }

  searchCardsByLine = (e) => {
    this.searchCards([['lineId', e.target.value]])
  }

  searchCardsByChapter = (e) => {
    this.searchCards([['chapterId', e.target.value]])
  }

  // array of ['key', value]
  searchCards = (options) => {
    const { pltr } = this.props
    const cards = pltr.cards

    const visibleCards = cards.filter((c) => options.some((op) => c[op[0]] == op[1]))
    this.setState({ tree: visibleCards, path: 'cards' })
  }

  searchLines = (e) => {
    const { pltr } = this.props
    const lines = pltr.lines

    const visibleLines = lines.filter((l) => l.id == e.target.value)
    this.setState({ tree: visibleLines, path: 'lines' })
  }

  searchChapters = (e) => {
    const { pltr } = this.props
    const chapters = pltr.chapters

    const visibleChapters = chapters.filter((c) => c.id == e.target.value)
    this.setState({ tree: visibleChapters, path: 'chapters' })
  }

  searchCardsById = (e) => {
    const { pltr } = this.props
    const cards = pltr.cards

    const visibleCards = cards.filter((c) => c.id == e.target.value)
    this.setState({ tree: visibleCards, path: 'cards' })
  }

  searchAbandoned = () => {
    const { pltr } = this.props
    const cards = pltr.cards

    const lineIds = pltr.lines.map((l) => l.id)
    const chapterIds = pltr.chapters.map((ch) => ch.id)
    const seriesLineIds = pltr.seriesLines.map((sl) => sl.id)
    const beatIds = pltr.beats.map((b) => b.id)

    const visibleCards = cards.filter((c) => {
      return (
        !lineIds.includes(c.lineId) &&
        !chapterIds.includes(c.chapterId) &&
        !seriesLineIds.includes(c.seriesLineId) &&
        !beatIds.includes(c.beatId)
      )
    })
    this.setState({ tree: visibleCards, path: 'cards' })
  }

  searchDuplicateChapters = () => {
    const { pltr } = this.props
    const chapterIds = pltr.chapters.map((ch) => ch.id)
    const duplicateIds = keys(pickBy(groupBy(chapterIds), (x) => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = groupBy(
        pltr.chapters.filter((ch) => duplicateIds.includes(ch.id)),
        'id'
      )
    }
    this.setState({ tree: visible, path: 'chapters' })
  }

  searchDuplicateLines = () => {
    const { pltr } = this.props
    const lineIds = pltr.lines.map((l) => l.id)
    const duplicateIds = keys(pickBy(groupBy(lineIds), (x) => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = groupBy(
        pltr.lines.filter((l) => duplicateIds.includes(l.id)),
        'id'
      )
    }
    this.setState({ tree: visible, path: 'lines' })
  }

  searchDuplicateCards = () => {
    const { pltr } = this.props
    const cardIds = pltr.cards.map((c) => c.id)
    const duplicateIds = keys(pickBy(groupBy(cardIds), (x) => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = groupBy(
        pltr.cards.filter((c) => duplicateIds.includes(c.id)),
        'id'
      )
    }
    this.setState({ tree: visible, path: 'cards' })
  }

  searchChaptersByPosition = (e) => {
    const { pltr } = this.props
    const chapters = pltr.chapters

    const visibleChapters = chapters.filter((c) => c.position == e.target.value)
    this.setState({ tree: visibleChapters, path: 'chapters' })
  }

  moveBookToIdOne = () => {
    const input = findDOMNode(this.idToMove)
    const idToMove = input.value
    if (idToMove) {
      if (idToMove == 'series') {
        // beats -> chapters (bookId 1)
        // seriesLines -> lines (bookId 1)
      } else {
        const { pltr } = this.props
        const re = new RegExp(`bookId\":\s?${idToMove},`, 'g')
        const resultJson = JSON.parse(JSON.stringify(pltr).replace(re, 'bookId":1,'))
        resultJson.books['1'] = resultJson.books[`${idToMove}`]
        delete resultJson.books[`${idToMove}`]
        resultJson.books['1'].id = 1
        // change allIds
        // think about currentTimeline
        console.log(
          resultJson.books,
          resultJson.chapters.filter((ch) => ch.bookId == '1'),
          resultJson.lines.filter((ch) => ch.bookId == '1')
        )
        // saveFile('/Users/sparrowhawk/output.pltr', resultJson)
      }
    }
  }

  renderDetails() {
    if (!this.state.tree) return null

    return (
      <div className="analyzer__details">
        <ReactJson src={this.state.tree} name={this.state.path} iconStyle="circle" />
      </div>
    )
  }

  renderTree() {
    const { pltr } = this.props
    return (
      <div className="analyzer__tree">
        <Inspector data={pltr} onClick={this.handleClick} searchOptions={{ debounceTime: 300 }} />
      </div>
    )
  }

  renderTab() {
    const { pltr } = this.props
    if (this.state.tab == 'search') {
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              {this.renderTree()}
            </Col>
            <Col sm={12} md={7}>
              <h3>{this.state.path}</h3>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'cards') {
      const id = nextId(pltr.cards)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input onChange={this.searchCardsById} placeholder="Card Id" />
                <input onChange={this.searchCardsByLine} placeholder="Line Id" />
                <input onChange={this.searchCardsByChapter} placeholder="Chapter Id" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchAbandoned}>
                    Abandoned
                  </a>
                </span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchDuplicateCards}>
                    Duplicates
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'lines') {
      const id = nextId(pltr.lines)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input onChange={this.searchLines} placeholder="Line Id" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchDuplicateLines}>
                    Duplicates
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'chapters') {
      const id = nextId(pltr.chapters)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input onChange={this.searchChaptersByPosition} placeholder="Chapter Position" />
                <input onChange={this.searchChapters} placeholder="Chapter Id" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchDuplicateChapters}>
                    Duplicates
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'books') {
      const id = objectId(pltr.books)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input ref={(r) => (this.idToMove = r)} placeholder="Id To Move" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.moveBookToIdOne}>
                    Move to Book 1
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }
  }

  render() {
    const { pltr } = this.props
    return (
      <div className="analyzer__container">
        <h3>
          {pltr.file.version} <small>{pltr.file.fileName}</small>
          <DevFileDrop />
        </h3>
        <div className="analyzer__tabs">
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'search', tree: null, path: null })}
          >
            Search
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'cards', tree: null, path: null })}
          >
            Cards
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'lines', tree: null, path: null })}
          >
            Lines
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'chapters', tree: null, path: null })}
          >
            Chapters
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'books', tree: null, path: null })}
          >
            Books
          </span>
        </div>
        {this.renderTab()}
        <div></div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    pltr: state.present,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Analyzer)
