export default function migrate(data) {
  if (data.file && data.file.version === 'TBD_2022.9.28') return data

  return data
}
