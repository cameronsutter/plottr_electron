import { removeSystemKeys } from 'pltr/v2'

import extractConvertAndPatch from '../word/exporters/convertImages'

// We might want to do more to export to a self-contained file in the future.
const exportToSelfContainedPlottrFile = (file, userId, downloadStorageImage) => {
  const withoutSystemKeys = removeSystemKeys(file)
  return extractConvertAndPatch(withoutSystemKeys, userId, downloadStorageImage, false)
}

export default exportToSelfContainedPlottrFile
