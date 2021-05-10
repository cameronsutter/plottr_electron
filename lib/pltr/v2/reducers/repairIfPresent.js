export const repairIfPresent = (dataRepairers) => (name) => (data) => {
  if (dataRepairers[name]) {
    return dataRepairers[name](data)
  }

  return data
}
