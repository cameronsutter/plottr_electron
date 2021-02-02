import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FormControl } from 'react-bootstrap'
import i18n from 'format-message'

class CategoryPicker extends Component {
  onChange = () => {
    const val = findDOMNode(this.refs.selectRef).value
    this.props.onChange(val == -1 ? null : val)
  }

  renderOptions() {
    const categories = [...this.props.categories]
    categories.push({ id: -1, name: i18n('Uncategorized') })
    return categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))
  }

  render() {
    let val = this.props.selectedId ? this.props.selectedId : -1
    return (
      <FormControl
        componentClass="select"
        placeholder={i18n('Choose')}
        onChange={this.onChange}
        ref="selectRef"
        value={val}
      >
        {this.renderOptions()}
      </FormControl>
    )
  }

  static propTypes = {
    categories: PropTypes.array,
    type: PropTypes.oneOf(['characters', 'places', 'notes', 'tags']),
    onChange: PropTypes.func.isRequired,
    selectedId: PropTypes.any,
  }
}

function mapStateToProps(state, ownProps) {
  return {
    categories: state.present.categories[ownProps.type],
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPicker)
