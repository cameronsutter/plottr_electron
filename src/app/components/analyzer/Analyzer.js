import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { get, set } from 'lodash' // possibly will be used to edit values
import { Grid, Row, Col } from 'react-bootstrap'
import ReactJson from 'react-json-view'
import Inspector from 'react-json-inspector'
import 'style-loader!css-loader!sass-loader!../../../../node_modules/react-json-inspector/json-inspector.css'

class Analyzer extends Component {
  state = {path: null, tree: null}

  handleClick = ({key, value, path}) => {
    if (path != '') {
      this.setState({path: path, tree: value})
    }
  }

  renderDetails () {
    if (!this.state.tree) return null

    return <div style={{padding: '10px'}}><ReactJson src={ this.state.tree } name={this.state.path} iconStyle='circle' /></div>
  }

  renderTree () {
    const { pltr } = this.props
    return <div style={{padding: '10px'}}><Inspector data={ pltr } onClick={this.handleClick} searchOptions={{debounceTime: 300}}/></div>
  }

  render () {
    const { pltr } = this.props
    return <div style={{padding: '10px'}}>
      <h3>{pltr.file.version}{' '}<small>{pltr.file.fileName}</small></h3>
      <Grid fluid>
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
