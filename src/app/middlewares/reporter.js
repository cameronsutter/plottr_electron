import { setPreviousAction } from '../../common/utils/error_reporter'

const reporter = (store) => (next) => (action) => {
  setPreviousAction(action)
  return next(action)
}

export default reporter
