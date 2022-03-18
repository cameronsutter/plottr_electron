import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { FormControl } from 'react-bootstrap'
import { t } from 'plottr_locales'

import { checkDependencies } from './checkDependencies'

const CategoryPickerConnector = (connector) => {
  class CategoryPicker extends Component {
    constructor(props) {
      super(props)
      this.selectRef = null
    }

    onChange = () => {
      const val = this.selectRef.value
      this.props.onChange(val == -1 ? null : val)
    }

    renderOptions() {
      const categories = [...this.props.categories]
      categories.push({ id: -1, name: t('Uncategorized') })
      return categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {t(cat.name)}
        </option>
      ))
    }

    render() {
      let val = this.props.selectedId ? this.props.selectedId : -1
      return (
        <FormControl
          componentClass="select"
          placeholder={t('Choose')}
          onChange={this.onChange}
          inputRef={(ref) => {
            this.selectRef = ref
          }}
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

  const { redux } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux
    return connect((state, ownProps) => {
      return {
        categories: state.present.categories[ownProps.type],
      }
    })(CategoryPicker)
  }

  throw new Error('Cannot connect CategoryPicker.js')
}

export default CategoryPickerConnector
