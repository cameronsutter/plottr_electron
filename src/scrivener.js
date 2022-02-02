import { readdirSync, readFileSync, statSync } from 'fs'
import { readdir, readFile, stat } from 'fs.promises'
import path from 'path'
import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'

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

// [{ filePath: String, isSectionRTF: Bool }] -> [String]
const keepNonSectionRTFFiles = (results) => {
  return results
    ?.filter((item) => item)
    ?.filter(({ isSectionRTF }) => !isSectionRTF)
    ?.map(({ filePath }) => filePath)
}

// [{ filePath: String, isSectionRTF: Bool }] -> [String]
const keepSectionRTFFiles = (results) => {
  return results
    ?.filter((item) => item)
    ?.filter(({ isSectionRTF }) => isSectionRTF)
    ?.map(({ filePath }) => filePath)
}

// Step 1: find all the RTF files recursively.
// String -> Promise<[String]>
export const findRelevantFiles = (directory) => {
  const filesInDirectory = readdir(directory)
  const checkedEntries = filesInDirectory.then((files) => {
    return Promise.all(files.map((file) => isSectionRTF(directory, file)))
  })
  const folders = checkedEntries.then(keepNonSectionRTFFiles).then(keepOnlyFolders)
  console.log('folders ==>', folders)
  const sectionRTFFiles = checkedEntries.then(keepSectionRTFFiles)
  const filesForSubFolders = Promise.all(folders?.map((folder) => findRelevantFiles(folder)))
  return sectionRTFFiles.then((filesForCurrentFolder) =>
    filesForCurrentFolder.concat(...filesForSubFolders)
  )
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
    return pathResults
      ?.filter((item) => item)
      ?.filter(({ isAFolder }) => isAFolder)
      ?.map(({ path }) => path)
  })
}

// Promise<[{uuid: String, content: String}]>
// export const getContentRTF = (scriv) => {
//   const noteFileContent = ['content.rtf', 'synopsis.txt', 'content.pdf']
//   const filesInScriv = readdirSync(scriv)
//   return Promise.all(
//     filesInScriv.map((file) => {
//       const isVer_2_7 =
//         file.includes('_synopsis.txt') ||
//         file.includes('_notes.rtf') ||
//         Number(file.replace('.rtf', ''))
//       const absolute = path.join(scriv, file)
//       const isSectionRTF =
//         (UUIDFolderRegEx.test(absolute) && noteFileContent.includes(file)) || isVer_2_7

//       if (statSync(absolute).isDirectory()) {
//         return getContentRTF(absolute)
//       } else if (isSectionRTF) {
//         const uuid = UUIDFolderRegEx.test(absolute)
//           ? absolute.match(UUIDFolderRegEx)[0]
//           : isVer_2_7
//           ? file.match(/\d+/)[0]
//           : null
//         const notesRTF = readFileSync(absolute)
//         const htmlArr = rtfToHTML(String(notesRTF)).then((res) => {
//           return new Promise((resolve) => {
//             resolve(res)
//           })
//         })

//         if (notesRTF) {
//           return { uuid, content: htmlArr }
//         }
//       }
//     })
//   )
//     .then((i) => {
//       console.log('i', i)
//       return Object.entries(i).length > 0 ? i : null
//     })
//     .then((i) => {
//       return i?.length ? Promise.all(i.flatMap((i) => i).filter((i) => !!i)) : null
//     })
//     .catch((error) => console.log('error', error))
// }

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

// String, String -> Promise<{filePath: String, isSectionRTF: Bool}>
const isSectionRTF = (directory, fileName) => {
  const filePath = toFullPath(directory, fileName)
  console.log('UUIDFolderRegEx.test(filePath)', UUIDFolderRegEx.test(filePath))
  const isVer_2_7 =
    filePath.endsWith('_synopsis.txt') ||
    filePath.endsWith('_notes.rtf') ||
    (Number(filePath.replace('.rtf', '')) ? true : false)

  return readFile(filePath)
    .then((fileContents) => {
      return {
        filePath,
        isSectionRTF: UUIDFolderRegEx.test(filePath) || isVer_2_7,
      }
    })
    .catch((err) => console.log('Error reading the file', err))
}

const parseToHTML = (noteRtf, title) => {
  const content = noteRtf.content.replace(`{${title}}`, '')
  return rtfToHTML(content)
}

export const generateState = async (contentRtf, scrivx) => {
  return Object.values(scrivx).map((item, key) => {
    const scrivData = Promise.all(
      item.map((data) => {
        let childrenRTF = []
        let childRTF = []
        if (data.children && data.children.length) {
          childRTF = Promise.all(
            data.children.map((child, key) => {
              let htmlElem = []
              const noteRtf = contentRtf.find((rtf) => rtf.uuid === child.uuid)
              if (noteRtf) {
                const parsed = parseToHTML(noteRtf, child.title)
                if (parsed) htmlElem.push(parsed)
              }
              return {
                id: key + 1,
                title: child.title,
                content: htmlElem || [],
              }
            })
          )
          childrenRTF = Promise.all(childRTF)
          return {
            uuid: data.uuid,
            title: data.title,
            children: childrenRTF.length ? childrenRTF : [],
          }
        } else {
          return {
            uuid: data.uuid,
            title: data.title,
          }
        }
      })
    )

    // index 0 is the manuscript/draft folder
    if (key > 0) {
      return (scrivx['sections'] = Promise.all([...scrivData]))
    } else {
      return (scrivx['draft'] = Promise.all([...scrivData]))
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
        const metadata = i.querySelector('MetaData')

        if (children) {
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
