import { readdirSync, readFileSync } from 'fs'
import { readdir, readFile, stat } from 'fs.promises'
import path from 'path'
import log from 'electron-log'
import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'
import { HTMLToSlateParagraph } from 'pltr/v2/slate_serializers/from_html'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/
// Object -> { Draft: [Object], Content: [Object] }
const parseScrivxData = (data) => {
  let sectionsArr = []
  let draftArr = []
  const parser = new DOMParser()
  const htmlData = parser.parseFromString(data, 'text/html')
  const children = htmlData.querySelectorAll('ScrivenerProject Binder > BinderItem')

  Array.from(children).map((i, key) => {
    const isDraftFolder = i.closest('BinderItem').getAttribute('type') === 'DraftFolder'
    const isNew = i.querySelectorAll('MetaData')
    if (isDraftFolder) {
      const draft = getBinderContents(i, key)
      if (draft.length) {
        draftArr = draft
      }
    } else if (!isDraftFolder && !isNew.length) {
      const sec = getBinderContents(i, key)
      if (sec.length) {
        sectionsArr = sec
      }
    } else if (isNew.length) {
      const children = i.querySelector('children')

      sectionsArr.push({
        uuid: i.getAttribute('uuid') || i.getAttribute('id'),
        title: i.querySelector('title').textContent,
        children: children
          ? [
              {
                uuid: children?.querySelector('binderitem')?.getAttribute('uuid'),
                title: children?.querySelector('title')?.textContent,
              },
            ]
          : [],
      })
    }
  })

  return {
    draft: draftArr,
    sections: sectionsArr,
  }
}

// [{ filePath: String, isRelevant: Bool }] -> [String]
const keepNonSectionRTFFiles = (results) => {
  return results.filter(({ isRelevant }) => !isRelevant).map(({ filePath }) => filePath)
}

// [{ filePath: String, isRelevant: Bool }] -> [String]
const keepSectionRTFFiles = (results) => {
  return results.filter(({ isRelevant }) => isRelevant).map(({ filePath }) => filePath)
}

// Step 1: find all the RTF files recursively.
// String -> Promise<[String]>
export const findRelevantFiles = (directory) => {
  const filesInDirectory = readdir(directory)
  const checkedEntries = filesInDirectory.then((files) => {
    return Promise.all(files.map((file) => isRelevantFile(directory, file)))
  })
  const folders = checkedEntries.then(keepNonSectionRTFFiles).then(keepOnlyFolders)
  const sectionRTFFiles = checkedEntries.then(keepSectionRTFFiles)
  const filesForSubFolders = folders
    .then((dirs) => {
      return Promise.all(dirs.map(findRelevantFiles))
    })
    .catch((err) => {
      log.error(err)
      return Promise.all([])
    })

  return sectionRTFFiles
    .then((filesForCurrentFolder) => {
      return filesForSubFolders.then((subFolderResults) =>
        filesForCurrentFolder.concat(...subFolderResults)
      )
    })
    .catch((err) => {
      log.error(err)
      return Promise.all([])
    })
}

// String -> Promise<Bool>
const isFolder = (filePath) => {
  return stat(filePath).then((result) => result.isDirectory())
}

// [String] -> Promise<[String]>
const keepOnlyFolders = (paths) => {
  const testedPaths = Promise.all(
    paths.map((path) => {
      return isFolder(path).then((isAFolder) => {
        return {
          isAFolder,
          path,
        }
      })
    })
  )
  return testedPaths.then((pathResults) => {
    return pathResults.filter(({ isAFolder }) => isAFolder).map(({ path }) => path)
  })
}

export const getScrivxData = (scriv) => {
  const filesInScriv = readdirSync(scriv)
  const scrivFile = filesInScriv.find((file) => path.extname(file) === '.scrivx')
  const absolute = path.join(scriv, scrivFile)
  const scrivxContent = readFileSync(absolute)
  const scrivData = parseScrivxData(scrivxContent, filesInScriv)
  if (scrivData) {
    return scrivData
  }
}

// String, String -> String
const toFullPath = (directory, filePath) => {
  return path.join(directory, filePath)
}

// String, String -> Promise<{filePath: String, isRelevant: Bool}>
const isRelevantFile = (directory, fileName) => {
  const filePath = toFullPath(directory, fileName)
  const isRTF = path.extname(fileName) === '.rtf' || path.extname(fileName) === '.txt'
  const isVer_2_7 =
    filePath.endsWith('_synopsis.txt') ||
    filePath.endsWith('_notes.rtf') ||
    (Number(filePath.replace('.rtf', '')) ? true : false)

  return readFile(filePath)
    .then((fileContents) => {
      return {
        filePath,
        isRelevant: isRTF ? true : false,
      }
    })
    .catch((error) =>
      isFolder(filePath)
        .then((isAFolder) => {
          return {
            filePath,
            isRelevant: false,
          }
        })
        .catch((error) => {
          log.error(error)
          return false
        })
    )
}

// String ->  Object { plotline: <string> }
const getPlotline = (data) => {
  if (data && data.children && data.children[0]) {
    const plotline = data.children[0][0].text
    return { plotline: plotline.split('Plotline: ').pop() }
  }
}

// String -> Object
const readRTF = (filePath) => {
  const isNoteRTF = path.basename(filePath) === 'notes.rtf'
  return readFile(filePath).then((rtfData) => {
    const stringRTF = rtfData.toString()
    if (isNoteRTF) {
      return rtfToHTML(stringRTF).then((res) => {
        const slateData = HTMLToSlateParagraph(res)
        return getPlotline(slateData)
      })
    } else {
      return rtfToHTML(stringRTF).then((res) => {
        return HTMLToSlateParagraph(res)
      })
    }
  })
}

// String -> String
const getTxtContent = (path) => {
  const txtContent = readFileSync(path)
  const content = txtContent.toString()

  // remove `Click to edit`
  return content.split('Click to edit').pop()
}

// String -> Promise<object>
const parseData = (paths) => {
  return Promise.all(
    paths.map((filePath) => {
      const fileType = path.extname(filePath)

      if (fileType === '.txt') {
        return Promise.resolve({ synopsis: getTxtContent(filePath) })
      } else {
        return readRTF(filePath).then((data) => {
          return { rtf: data }
        })
      }
    })
  )
}

// Array, Object, -> Promise<{ draft: [Any], sections: [Any] }>
export const generateState = (contentRtf, scrivx) => {
  return Promise.all(
    Object.values(scrivx).map((item, key) => {
      return Promise.all(
        item.map((scrivxFileData) => {
          if (scrivxFileData.children && scrivxFileData.children.length) {
            return Promise.all(
              scrivxFileData.children.map((child, key) => {
                const noteRtf = contentRtf.filter((rtf) => rtf.includes(child.uuid))
                return parseData(noteRtf).then((parsed) => {
                  return {
                    id: key + 1,
                    title: child.title,
                    content: parsed,
                  }
                })
              })
            ).then((childrenData) => {
              return {
                uuid: scrivxFileData.uuid,
                title: scrivxFileData.title,
                children: childrenData,
              }
            })
          } else {
            // if binder has no children but has rtf/txt files
            const noteRtf = contentRtf.filter((rtf) => rtf.includes(scrivxFileData.uuid))
            if (noteRtf.length) {
              return parseData(noteRtf).then((parsed) => {
                return {
                  uuid: scrivxFileData.uuid,
                  title: `Beat ${key + 1}`,
                  children: [
                    {
                      id: key + 1,
                      title: scrivxFileData.title,
                      content: parsed,
                    },
                  ],
                }
              })
            } else {
              // if no child and no relevant files
              return {
                uuid: scrivxFileData.uuid,
                title: scrivxFileData.title,
              }
            }
          }
        })
      ).then((data) => {
        return data
      })
    })
  ).then((state) => {
    return {
      draft: state[0],
      sections: state[1],
    }
  })
}

const generateChildrenBinderItems = (uuid, title, childTag) => {
  let noteObj = { uuid, title: title.textContent || null, children: [] }

  if (childTag) {
    const childBinderItem = childTag.querySelectorAll('BinderItem')
    Array.from(childBinderItem).map((c) => {
      const childUUID = c.getAttribute('uuid') || c.getAttribute('id')
      const childTitle = c.querySelector('Title')
      const childChildren = c.querySelector('Children')

      if (childChildren) {
        return generateChildrenBinderItems(childUUID, childTitle, childChildren)
      }

      noteObj.children.push({
        uuid: childUUID,
        title: childTitle.textContent,
      })
    })
    return noteObj
  } else {
    return noteObj
  }
}

const getBinderContents = (item, key) => {
  if (item) {
    const binderItem = item.querySelectorAll('BinderItem')
    return Array.from(binderItem)
      .map((i) => {
        let generateContent
        const uuid = i.getAttribute('uuid') || i.getAttribute('id')
        const title = i.querySelector('Title')
        const children = i.querySelector('Children')
        const isTextBinder = i.getAttribute('type') === 'Text'
        const metadata = i.querySelector('MetaData')

        if (children || (metadata && isTextBinder)) {
          generateContent = generateChildrenBinderItems(uuid, title, children)
        } else if (metadata) {
          generateContent = []
          generateContent = {
            uuid,
            title: title.textContent,
          }
        }
        return generateContent
      })
      .filter((i) => !!i)
  }
}
