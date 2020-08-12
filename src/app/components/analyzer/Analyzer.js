import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { get, set, groupBy, pickBy, keys, value } from 'lodash' // get/set will possibly be used to edit values
import { Grid, Row, Col } from 'react-bootstrap'
import ReactJson from 'react-json-view'
import Inspector from 'react-json-inspector'
import 'style-loader!css-loader!sass-loader!../../../../node_modules/react-json-inspector/json-inspector.css'

class Analyzer extends Component {
  state = {tab: 'search', path: null, tree: null}

  handleClick = ({key, value, path}) => {
    if (path != '') {
      this.setState({path: path, tree: value})
    }
  }

  searchCardsByLine = e => {
    this.searchCards([['lineId', e.target.value]])
  }

  searchCardsByChapter = e => {
    this.searchCards([['chapterId', e.target.value]])
  }

  // array of ['key', value]
  searchCards = options => {
    const { pltr } = this.props
    const cards = pltr.cards

    const visibleCards = cards.filter(c => options.some(op => c[op[0]] == op[1]))
    this.setState({tree: visibleCards})
  }

  searchLines = e => {
    const { pltr } = this.props
    const lines = pltr.lines

    const visibleLines = lines.filter(l => l.id == e.target.value)
    this.setState({tree: visibleLines})
  }

  searchChapters = e => {
    const { pltr } = this.props
    const chapters = pltr.chapters

    const visibleChapters = chapters.filter(c => c.id == e.target.value)
    this.setState({tree: visibleChapters})
  }

  searchCardsById = e => {
    const { pltr } = this.props
    const cards = pltr.cards

    const visibleCards = cards.filter(c => c.id == e.target.value)
    this.setState({tree: visibleCards})
  }

  searchAbandoned = () => {
    const { pltr } = this.props
    const cards = pltr.cards

    const lineIds = pltr.lines.map(l => l.id)
    const chapterIds = pltr.chapters.map(ch => ch.id)
    const seriesLineIds = pltr.seriesLines.map(sl => sl.id)
    const beatIds = pltr.beats.map(b => b.id)

    const visibleCards = cards.filter(c => {
      let result = false
      if (!lineIds.includes(c.lineId)) result = result || true
      if (!chapterIds.includes(c.chapterId)) result = result || true
      if (!seriesLineIds.includes(c.seriesLineId)) result = result || true
      if (!beatIds.includes(c.beatId)) result = result || true
      return result
    })
    this.setState({tree: visibleCards})
  }

  searchDuplicateChapters = () => {
    const { pltr } = this.props
    const chapterIds = pltr.chapters.map(ch => ch.id)
    const duplicateIds = keys(pickBy(groupBy(chapterIds), x => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = pltr.chapters.filter(ch => duplicateIds.includes(ch.id))
    }
    this.setState({tree: visible})
  }

  searchDuplicateLines = () => {
    const { pltr } = this.props
    const lineIds = pltr.lines.map(ch => ch.id)
    const duplicateIds = keys(pickBy(groupBy(lineIds), x => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = pltr.lines.filter(ch => duplicateIds.includes(ch.id))
    }
    this.setState({tree: visible})
  }

  renderDetails () {
    if (!this.state.tree) return null

    return <div className='analyzer__details'><ReactJson src={ this.state.tree } name={this.state.path} iconStyle='circle' /></div>
  }

  renderTree () {
    const { pltr } = this.props
    return <div className='analyzer__tree'><Inspector data={ pltr } onClick={this.handleClick} searchOptions={{debounceTime: 300}}/></div>
  }

  renderTab () {
    if (this.state.tab == 'search') {
      return <Grid fluid>
        <Row>
          <Col sm={12} md={5}>
            { this.renderTree() }
          </Col>
          <Col sm={12} md={7}>
            <h3>{this.state.path}</h3>
            { this.renderDetails() }
          </Col>
        </Row>
      </Grid>
    }

    if (this.state.tab == 'cards') {
      return <Grid fluid>
        <Row>
          <Col sm={12} md={5}>
            <div>
              <input onChange={this.searchCardsById} placeholder='Card Id'/>
              <input onChange={this.searchCardsByLine} placeholder='Line Id'/>
              <input onChange={this.searchCardsByChapter} placeholder='Chapter Id'/>
              <a href='#' onClick={this.searchAbandoned}>Abandoned</a>
            </div>
            { this.renderDetails() }
          </Col>
        </Row>
      </Grid>
    }

    if (this.state.tab == 'lines') {
      return <Grid fluid>
        <Row>
          <Col sm={12} md={5}>
            <div>
              <input onChange={this.searchLines} placeholder='Line Id'/>
              <a href='#' onClick={this.searchDuplicateLines}>Duplicates</a>
            </div>
            { this.renderDetails() }
          </Col>
        </Row>
      </Grid>
    }

    if (this.state.tab == 'chapters') {
      return <Grid fluid>
        <Row>
          <Col sm={12} md={5}>
            <div>
              <input onChange={this.searchChapters} placeholder='Chapter Id'/>
              <a href='#' onClick={this.searchDuplicateChapters}>Duplicates</a>
            </div>
            { this.renderDetails() }
          </Col>
        </Row>
      </Grid>
    }
  }

  render () {
    const { pltr } = this.props
    return <div className='analyzer__container'>
      <h3>{pltr.file.version}{' '}<small>{pltr.file.fileName}</small></h3>
      <div className='analyzer__tabs'>
        <span className='analyzer__tab' onClick={() => this.setState({tab: 'search'})}>Search</span>
        <span className='analyzer__tab' onClick={() => this.setState({tab: 'cards'})}>Cards</span>
        <span className='analyzer__tab' onClick={() => this.setState({tab: 'lines'})}>Lines</span>
        <span className='analyzer__tab' onClick={() => this.setState({tab: 'chapters'})}>Chapters</span>
      </div>
      {this.renderTab()}
      <div></div>
    </div>
  }
}

function mapStateToProps (state) {
  return {
    pltr: state.present,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Analyzer)
