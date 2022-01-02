import axios from 'axios'

export const uploadToFirebase = (emailAddress, userId, file, fileName) => {
  const newFile = {
    ...file.file,
    none: false,
    fileName,
    shareRecords: [{ emailAddress, permission: 'owner' }],
    version: file.file.version,
  }
  delete newFile.id
  return axios.post(
    `https://${process.env.API_BASE_DOMAIN}/api/new-file`,
    {
      fileRecord: newFile,
      file,
    },
    { params: { userId } }
  )
}
