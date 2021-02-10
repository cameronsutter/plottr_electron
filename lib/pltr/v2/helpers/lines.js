import { isSeries as isSeriesString } from './books'

export const associateWithBroadestScope = (bookId) => bookId || 'series'

export const isSeries = ({ bookId }) => isSeriesString(bookId)

export const isNotSeries = ({ bookId }) => !isSeriesString(bookId)
