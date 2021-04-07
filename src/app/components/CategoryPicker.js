import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FormControl } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'

class CategoryPicker extends Component {
  constructor(props) {
    super(props)
    this.selectRef = React.createRef()
  }

  onChange = () => {
    const val = this.selectRef.current.value
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
        inputRef={this.selectRef}
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
