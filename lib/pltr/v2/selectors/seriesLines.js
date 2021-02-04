const isSeriesLine = ({ bookId }) => bookId === 'series'

export const allSeriesLinesSelector = (state) => state.lines.filter(isSeriesLine)
