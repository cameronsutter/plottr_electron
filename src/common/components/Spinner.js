import React from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import { FaSpinner } from 'react-icons/fa'

export const Spinner = ({ style = {} }) => {
  return <FaSpinner className="fa-spinner" style={style} />
}

Spinner.propTypes = {
  style: PropTypes.object,
}

export const FunSpinner = ({ size }) => {
  let style = {
    fontSize: size || '2.5em',
  }
  return (
    <div className="fun-spinner">
      <Spinner style={style} />
      <div>{i18n("Once You Plot, the Fun Don't Stop")}</div>
    </div>
  )
}

FunSpinner.propTypes = {
  size: PropTypes.string,
}
